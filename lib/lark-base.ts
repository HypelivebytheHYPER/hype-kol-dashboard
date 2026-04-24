// Lark Base data layer — generic fetcher for all tables
// All queries use POST /records/search — single protocol

import { SERVICES } from "./external-services";

const LARK_API_URL = SERVICES.larkWorker;
const LARK_API_KEY = process.env["LARK_API_KEY"];
const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";

// ============ Lark Base Table Registry ============

export const TABLES = {
  ALL_KOLS:         "tbl5864QVOiEokTQ",  // Main table — filter by KOLs Type or Inferred Categories
  LIVE_MC_LIST:     "tblozhTWBHelXqRR",  // Live MC portfolio with video refs
  DASHBOARD_SUMMARY:"tblOwkSqf5rci6zq",  // Pre-computed dashboard KPIs for fast UI loading
} as const;

type TableId = (typeof TABLES)[keyof typeof TABLES];

// ============ Types ============

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

/** Lark attachment — fields are optional because Lark omits them
 *  when the attachment metadata hasn't been fully indexed. */
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
  /** Bypass Next.js Data Cache. Use when fresh data is required. */
  cache?: "default" | "no-store" | "force-cache" | "only-if-cached";
  /** Seconds to cache the fetch result. 0 = no cache. */
  revalidate?: number;
}

interface FetchResult {
  data: LarkRecord[];
  total: number;
  hasMore: boolean;
  pageToken?: string;
}

// Lark API response shape (snake_case wire format).
interface LarkSearchResponse {
  data?: LarkRecord[];
  total?: number;
  has_more?: boolean;
  page_token?: string;
}

// ============ Auth Headers ============

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (LARK_API_KEY) h["Authorization"] = `Bearer ${LARK_API_KEY}`;
  return h;
}

// ============ Core Fetcher ============

export async function fetchRecords(
  tableId: TableId,
  opts: FetchOptions = {}
): Promise<FetchResult> {
  const { pageSize = 100, filter, fieldNames, sort, tags = [] } = opts;

  // Translate camelCase consumer API → snake_case Lark wire format at the boundary.
  const wireFilter = filter && {
    conjunction: filter.conjunction,
    conditions: filter.conditions.map((c) => ({
      field_name: c.fieldName,
      operator: c.operator,
      value: c.value,
    })),
  };
  const wireSort = sort?.map((s) => ({ field_name: s.fieldName, desc: s.desc }));

  const res = await fetch(`${LARK_API_URL}/records/search`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      app_token: APP_TOKEN,
      table_id: tableId,
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

  if (!res.ok) return { data: [], total: 0, hasMore: false };

  const json = (await res.json()) as LarkSearchResponse;
  // `exactOptionalPropertyTypes`: omit the key entirely when undefined rather
  // than writing `pageToken: undefined` (which would violate the optional type).
  const result: FetchResult = {
    data: Array.isArray(json.data) ? json.data : [],
    total: json.total ?? 0,
    hasMore: json.has_more ?? false,
  };
  if (json.page_token) result.pageToken = json.page_token;
  return result;
}

// ============ Fetch All (paginate until exhausted) ============

/**
 * Fetch every record in a table by looping through pages until `hasMore` is
 * false. Uses POST `/records/search` (not GET `/records/:app/:table`) because
 * only the search endpoint enriches select/formula fields with human labels;
 * GET returns raw option IDs like `optHMhw7yb`.
 *
 * Cost: N / 500 sequential HTTP round-trips. For 1,439 records = 3 requests.
 */
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

// ============ Field Helpers (POST /records/search format) ============
// Text:         [{text: "value", type: "text"}]
// Url:          [{link: "https://...", text: "..."}]
// Formula/Select: {type: 3, value: ["Label"]}
// MultiSelect:  ["Tag1", "Tag2"]
// Number:       12345
// Attachment:   [{file_token, name, size, type, url, tmp_url}]

export function str(fields: Record<string, unknown>, key: string): string {
  const v = fields[key];
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  // Rich text: [{text: "value"}]
  if (Array.isArray(v) && v[0]?.text) return String(v[0].text);
  // Formula/SingleSelect: {type: N, value: ["Label"]}
  if (typeof v === "object" && !Array.isArray(v) && (v as { value?: unknown[] }).value) {
    const val = (v as { value: unknown[] }).value;
    return Array.isArray(val) && val.length > 0 ? String(val[0]) : "";
  }
  return String(v);
}

export function num(fields: Record<string, unknown>, key: string): number {
  const v = fields[key];
  if (typeof v === "number") return v;
  // Formula number: {type: N, value: [123]}
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    const val = (v as { value?: unknown[] }).value;
    if (Array.isArray(val) && val.length > 0) return Number(val[0]) || 0;
  }
  return Number(v) || 0;
}

export function arr(fields: Record<string, unknown>, key: string): string[] {
  const v = fields[key];
  if (!Array.isArray(v)) return [];
  // Plain string array: ["Tag1", "Tag2"]
  if (typeof v[0] === "string") return v as string[];
  // Rich text array: [{text: "value"}]
  if (v[0]?.text) return v.map((item: { text: string }) => item.text);
  return [];
}

export function url(fields: Record<string, unknown>, key: string): string {
  const v = fields[key];
  if (typeof v === "string") return v;
  // Url field: [{link: "https://..."}]
  if (Array.isArray(v) && v[0]?.link) return String(v[0].link);
  // Object with link: {link: "https://..."}
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

// ============ Media URL ============

/**
 * Build a direct URL for bitable attachment media (video/image).
 * lark-http-hype /api/image/ endpoint is open (no auth needed)
 * and streams raw bytes when ?tableId= is provided.
 */
export function buildMediaUrl(token: string, tableId: TableId): string {
  return `${LARK_API_URL}/api/image/${token}?tableId=${tableId}`;
}

/**
 * Build media URLs for multiple tokens (same table).
 */
export function buildMediaUrls(
  tokens: string[],
  tableId: TableId
): Record<string, string> {
  return Object.fromEntries(
    tokens.map((t) => [t, buildMediaUrl(t, tableId)])
  );
}

// ── Record mutations ───────────────────────────────────────────────

interface BatchUpdateRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

interface BatchUpdatePayload {
  app_token: string;
  table_id: string;
  records: BatchUpdateRecord[];
}

/** Batch update records via the Lark worker.
 *  Endpoint: POST /records/batch_update */
export async function updateRecords(
  tableId: TableId,
  records: BatchUpdateRecord[]
): Promise<{ success: boolean; updated?: number; error?: string }> {
  const payload: BatchUpdatePayload = {
    app_token: APP_TOKEN,
    table_id: tableId,
    records,
  };

  const res = await fetch(`${LARK_API_URL}/records/batch_update`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    return { success: false, error: `${res.status}: ${text}` };
  }

  const json = await res.json().catch(() => ({}) as Record<string, unknown>);
  return {
    success: true,
    updated: (json as { records?: unknown[] }).records?.length ?? records.length,
  };
}
