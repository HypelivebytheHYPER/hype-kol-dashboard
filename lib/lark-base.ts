// Lark Base data layer — generic fetcher for all tables
// All queries use POST /records/search — single protocol

export const LARK_API_URL = process.env.NEXT_PUBLIC_LARK_API_URL || "https://lark-http-hype.hypelive.workers.dev";
const LARK_API_KEY = process.env.LARK_API_KEY;
const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";

// ============ Lark Base Table Registry ============

export const TABLES = {
  ALL_KOLS:    "tbl5864QVOiEokTQ",  // Main table — filter by KOLs Type or Inferred Categories
  LIVE_MC_LIST:"tblozhTWBHelXqRR",  // Live MC portfolio with video refs
  KOL_TECH:    "tbl8rJWSTEemTeJh",  // Tech creators (different schema)
} as const;

// KOLs Type field values (Formula: based on LiveGmv + VideoGmv)
export const KOL_TYPES = {
  LIVE_CREATOR: "Live Creator",  // LiveGmv > 0 AND VideoGmv > 0
  LIVE_SELLER: "Live Seller",    // LiveGmv > 0 only
  CREATOR: "Creator",            // VideoGmv > 0 or default
} as const;

export type KOLType = (typeof KOL_TYPES)[keyof typeof KOL_TYPES];

export type TableId = (typeof TABLES)[keyof typeof TABLES];

// ============ Types ============

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export interface LarkAttachment {
  file_token: string;
  name: string;
  size: number;
  type: string;
  url: string;
  tmp_url: string;
}

interface SearchFilter {
  conjunction: "and" | "or";
  conditions: Array<{
    field_name: string;
    operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty" | "isGreater" | "isLess";
    value: string[];
  }>;
}

interface FetchOptions {
  pageSize?: number;
  pageToken?: string;
  filter?: SearchFilter;
  fieldNames?: string[];
  sort?: Array<{ field_name: string; desc?: boolean }>;
  tags?: string[];
}

interface FetchResult {
  data: LarkRecord[];
  total: number;
  has_more: boolean;
  page_token?: string;
}

// ============ Request Deduplication ============

const inflight = new Map<string, Promise<unknown>>();

function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// ============ Auth Headers ============

export function authHeaders(): Record<string, string> {
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
  const cacheKey = `lark:${tableId}:${JSON.stringify({ pageSize, filter, fieldNames, sort })}`;

  return dedup(cacheKey, async () => {
    // Always POST /records/search — single protocol for all queries
    const res = await fetch(`${LARK_API_URL}/records/search`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        app_token: APP_TOKEN,
        table_id: tableId,
        page_size: pageSize,
        ...(opts.pageToken && { page_token: opts.pageToken }),
        ...(filter && { filter }),
        ...(fieldNames && { field_names: fieldNames }),
        ...(sort && { sort }),
      }),
      next: { tags: ["lark", ...tags] },
    });

    if (!res.ok) return { data: [], total: 0, has_more: false };

    const json = await res.json() as FetchResult;
    return {
      data: Array.isArray(json.data) ? json.data : [],
      total: json.total ?? 0,
      has_more: json.has_more ?? false,
      page_token: json.page_token,
    };
  });
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

export function attachments(fields: Record<string, unknown>, key: string): LarkAttachment[] {
  const v = fields[key];
  return Array.isArray(v) ? v as LarkAttachment[] : [];
}

// ============ Media URL ============

// Media download uses same base URL


/**
 * Resolve file tokens to Lark CDN temp URLs (24h valid, supports Range/byte-serving)
 * Use for video src — browser can do preload="metadata" with Range requests
 */
export async function resolveFileUrl(token: string): Promise<string> {
  const res = await fetch(`${LARK_API_URL}/api/image/${token}`);
  if (!res.ok) return "";
  const data = await res.json() as { url: string };
  return data.url || "";
}

export async function resolveFileUrls(tokens: string[]): Promise<Record<string, string>> {
  if (tokens.length === 0) return {};
  const entries = await Promise.all(
    tokens.map(async (t) => [t, await resolveFileUrl(t)] as const)
  );
  return Object.fromEntries(entries);
}
