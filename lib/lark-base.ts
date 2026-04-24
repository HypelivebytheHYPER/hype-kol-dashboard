// Lark Base data layer — calls Lark Open API directly for data
// Media URLs still route through Cloudflare Worker (Lark attachments need special handling)

import { SERVICES } from "./external-services";

const LARK_APP_ID = process.env["LARK_APP_ID"]!;
const LARK_APP_SECRET = process.env["LARK_APP_SECRET"]!;
const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";
const LARK_OPEN_API = "https://open.larksuite.com/open-apis";
const LARK_WORKER = SERVICES.larkWorker;

// ============ Lark Base Table Registry ============

export const TABLES = {
  ALL_KOLS:         "tblaijZshhnZLDWJ",
  LIVE_MC_LIST:     "tblozhTWBHelXqRR",
  DASHBOARD_SUMMARY:"tblOwkSqf5rci6zq",
  STUDIO_LIST:      "tblKvYwcJY7Yxa20",
  MC_REQUESTS:      "tbl6wOMD7TDJdWJV",
} as const;

type TableId = (typeof TABLES)[keyof typeof TABLES];

// ============ Types ============

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export interface LarkAttachment {
  file_token: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  tmp_url?: string;
}

interface SearchFilter {
  conjunction: "and" | "or";
  conditions: Array<{
    fieldName: string;
    operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty" | "isGreater" | "isLess";
    value: string[];
  }>;
}

interface FetchOptions {
  pageSize?: number;
  pageToken?: string;
  filter?: SearchFilter;
  fieldNames?: string[];
  sort?: Array<{ fieldName: string; desc?: boolean }>;
  tags?: string[];
  cache?: "default" | "no-store" | "force-cache" | "only-if-cached";
  revalidate?: number;
}

interface FetchResult {
  data: LarkRecord[];
  total: number;
  hasMore: boolean;
  pageToken?: string;
}

interface LarkSearchResponse {
  data?: {
    items?: LarkRecord[];
    total?: number;
    has_more?: boolean;
    page_token?: string;
  };
  code: number;
  msg: string;
}

// ============ Auth (cached tenant token) ============

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getTenantToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(`${LARK_OPEN_API}/auth/v3/app_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
  });

  const data = (await res.json()) as {
    code: number;
    tenant_access_token?: string;
    expire?: number;
    msg?: string;
  };

  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Lark auth failed: ${data.msg || "unknown"}`);
  }

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire ?? 7200) * 1000,
  };
  return cachedToken.token;
}

async function larkFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getTenantToken();
  const url = `${LARK_OPEN_API}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

// ============ Core Fetcher ============

export async function fetchRecords(
  tableId: TableId,
  opts: FetchOptions = {}
): Promise<FetchResult> {
  const { pageSize = 100, filter, fieldNames, sort, tags = [] } = opts;

  const wireFilter = filter && {
    conjunction: filter.conjunction,
    conditions: filter.conditions.map((c) => ({
      field_name: c.fieldName,
      operator: c.operator,
      value: c.value,
    })),
  };
  const wireSort = sort?.map((s) => ({ field_name: s.fieldName, desc: s.desc }));

  const res = await larkFetch(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/search`, {
    method: "POST",
    body: JSON.stringify({
      page_size: pageSize,
      ...(opts.pageToken && { page_token: opts.pageToken }),
      ...(wireFilter && { filter: wireFilter }),
      ...(fieldNames && { field_names: fieldNames }),
      ...(wireSort && { sort: wireSort }),
    }),
    next: {
      tags: ["lark", ...tags],
      ...(opts.cache && { cache: opts.cache }),
      ...(opts.revalidate !== undefined && { revalidate: opts.revalidate }),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown");
    console.error("Lark fetch error:", res.status, text);
    return { data: [], total: 0, hasMore: false };
  }

  const json = (await res.json()) as LarkSearchResponse;
  if (json.code !== 0) {
    console.error("Lark API error:", json.code, json.msg);
    return { data: [], total: 0, hasMore: false };
  }

  const items = json.data?.items ?? [];
  const result: FetchResult = {
    data: items,
    total: json.data?.total ?? 0,
    hasMore: json.data?.has_more ?? false,
  };
  if (json.data?.page_token) result.pageToken = json.data.page_token;
  return result;
}

// ============ Fetch All ============

export async function fetchAllRecords(
  tableId: TableId,
  opts: Omit<FetchOptions, "pageSize" | "pageToken"> = {}
): Promise<LarkRecord[]> {
  const all: LarkRecord[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 20; page++) {
    const res = await fetchRecords(tableId, {
      ...opts,
      pageSize: 500,
      ...(pageToken && { pageToken }),
    });
    all.push(...res.data);
    if (!res.hasMore || !res.pageToken) break;
    pageToken = res.pageToken;
  }
  return all;
}

// ============ Field Helpers ============

export function str(fields: Record<string, unknown>, key: string): string {
  const v = fields[key];
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v) && v[0]?.text) return String(v[0].text);
  if (typeof v === "object" && !Array.isArray(v) && (v as { value?: unknown[] }).value) {
    const val = (v as { value: unknown[] }).value;
    return Array.isArray(val) && val.length > 0 ? String(val[0]) : "";
  }
  return String(v);
}

export function num(fields: Record<string, unknown>, key: string): number {
  const v = fields[key];
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    const val = (v as { value?: unknown[] }).value;
    if (Array.isArray(val) && val.length > 0) return Number(val[0]) || 0;
  }
  return Number(v) || 0;
}

export function arr(fields: Record<string, unknown>, key: string): string[] {
  const v = fields[key];
  if (!Array.isArray(v)) return [];
  if (typeof v[0] === "string") return v as string[];
  if (v[0]?.text) return v.map((item: { text: string }) => item.text);
  return [];
}

export function url(fields: Record<string, unknown>, key: string): string {
  const v = fields[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]?.link) return String(v[0].link);
  if (typeof v === "object" && v !== null && (v as { link?: string }).link) {
    return String((v as { link: string }).link);
  }
  return "";
}

function isValidAttachment(v: unknown): v is LarkAttachment {
  if (typeof v !== "object" || v === null) return false;
  const a = v as Record<string, unknown>;
  return typeof a["file_token"] === "string" && typeof a["name"] === "string";
}

export function attachments(fields: Record<string, unknown>, key: string): LarkAttachment[] {
  const v = fields[key];
  return Array.isArray(v) ? v.filter(isValidAttachment) : [];
}

// ============ Media URL (via Worker) ============

/**
 * Build a URL for bitable attachment media (video/image).
 * The Cloudflare Worker proxies to Lark's internal attachment API,
 * which requires special handling not available via the public Open API.
 */
export function buildMediaUrl(token: string, tableId: TableId): string {
  return `${LARK_WORKER}/api/image/${token}?tableId=${tableId}`;
}

export function buildMediaUrls(
  tokens: string[],
  tableId: TableId
): Record<string, string> {
  return Object.fromEntries(tokens.map((t) => [t, buildMediaUrl(t, tableId)]));
}

// ============ Record Mutations ============

interface BatchUpdateRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export async function updateRecords(
  tableId: TableId,
  records: BatchUpdateRecord[]
): Promise<{ success: boolean; updated?: number; error?: string }> {
  const res = await larkFetch(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/batch_update`, {
    method: "POST",
    body: JSON.stringify({ records }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    return { success: false, error: `${res.status}: ${text}` };
  }

  const json = (await res.json()) as { code: number; msg: string; data?: { records?: unknown[] } };
  if (json.code !== 0) {
    return { success: false, error: `${json.code}: ${json.msg}` };
  }

  return {
    success: true,
    updated: json.data?.records?.length ?? records.length,
  };
}
