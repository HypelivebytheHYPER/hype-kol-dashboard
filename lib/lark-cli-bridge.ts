// Lark CLI Bridge — single data layer. All Base I/O goes through lark-cli.
//
// Consolidated protocol:
//   1. +table-get  → returns fields[] with {id, name, type} — ONE call per table
//   2. +record-list --view-id  → server-side filter/sort via view — ONE call
//   3. +record-list --field-id  → projection — reduces payload
//   4. +record-list --filter-json --sort-json  → dynamic filter+sort — ONE call
//   5. +record-batch-create/update/delete  → mutations
//
// No N+1. No raw fetch(). No manual token management.
//
// NOTE: +data-query DSL is BROKEN upstream (800004006). Do not use.
//       All aggregation is done client-side from filtered record sets.

import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// ─── Configuration ──────────────────────────────────────────────────────────

const BASE_TOKEN: string = process.env["LARK_BASE_TOKEN"] ?? "";

export const DASHBOARD_ID = process.env["LARK_DASHBOARD_ID"] ?? "";

// ─── View Registry ──────────────────────────────────────────────────────────
// Each view is a server-side filter/sort configuration in Lark Base.
// Use these instead of client-side filtering for better performance.
//
// ALL_KOLS (tbl5864QVOiEokTQ) views:
//   vewfxCsqZ6  Kols Management          — all records, no filter
//   vewXLqvmE4  Kols_by_type             — grouped by KOLs Type
//   vewBTWiiqS  Kols_by_specialization   — sorted by Levels of KOLs
//   vewBGUJyKE  Cleaning                 — grouped by Nickname (cleanup view)
//   vewwrNWBJD  Creator KOLs             — VideoGmv > 0
//   vewB7z2HDR  Live Seller KOLs         — LiveGmv > 0
//   vewL4Gwm2Q  Live Creator KOLs        — LiveGmv > 0 AND VideoGmv > 0
//   vewmNIShjx  Macro KOL Creators       — VideoGmv > 0 AND Follower >= 100k
//   vewC4ioP6S  TikTok with Photos       — Attachment is not empty
//
// LIVE_MC_LIST (tblozhTWBHelXqRR) views:
//   vewfxCsqZ6  Kols Management          — all MCs
//   vews3HU8qd  Live with Media          — MCs with media attachments

export const VIEWS = {
  // ALL_KOLS
  KOLS_ALL:              "vewfxCsqZ6",
  KOLS_BY_TYPE:          "vewXLqvmE4",
  KOLS_BY_SPECIALIZATION: "vewBTWiiqS",
  KOLS_CREATOR:          "vewwrNWBJD",
  KOLS_LIVE_SELLER:      "vewB7z2HDR",
  KOLS_LIVE_CREATOR:     "vewL4Gwm2Q",
  KOLS_MACRO_CREATOR:    "vewmNIShjx",
  KOLS_WITH_PHOTOS:      "vewC4ioP6S",
  // LIVE_MC_LIST
  MC_ALL:                "vewfxCsqZ6",
  MC_WITH_MEDIA:         "vews3HU8qd",
} as const;

export type ViewId = (typeof VIEWS)[keyof typeof VIEWS];

/** @deprecated Use VIEWS.MC_ALL instead */
export const LIVE_MC_VIEW_ID = VIEWS.MC_ALL;

export const DASHBOARD_BLOCKS = {
  TOTAL_KOLS_COUNT:     "chtlg4N4hc0dVNrBDoM1jMzAy3b",
  AVG_SELLING_PRICE:    "chtlg5UVscpiUyDW0097cme154b",
  SALES_CATEGORIES_PIE: "chtlgzXxRDqvSg2WZZJcCQB0Sag",
  COLLABORATION_STAGE:  "chtlgYEptemaNXad3f2iGpEDsSg",
  BEST_PRODUCTS:        "chtlgWCYXH84SBImzE98AknepDf",
  MONTHLY_GMV:          "chtlguVoqntBl0s07dokii1zTNh",
} as const;

export const TABLES = {
  ALL_KOLS:          "tbl5864QVOiEokTQ",
  KOL_LIVE_SELLER:   "tblaijZshhnZLDWJ",
  LIVE_MC_LIST:      "tblozhTWBHelXqRR",
  DASHBOARD_SUMMARY: "tblOwkSqf5rci6zq",
  STUDIO_LIST:       "tblKvYwcJY7Yxa20",
  MC_REQUESTS:       "tbl6wOMD7TDJdWJV",
} as const;

export type TableId = (typeof TABLES)[keyof typeof TABLES];

// ─── Types ──────────────────────────────────────────────────────────────────

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

export interface TableSchema {
  tableId: string;
  tableName: string;
  fields: Array<{ id: string; name: string; type: string }>;
  fieldNameToId: Map<string, string>;
  fieldIdToName: Map<string, string>;
  /** Field name → type map for query optimization */
  fieldTypeMap: Map<string, string>;
}

interface FetchOptions {
  pageSize?: number;
  pageToken?: string;
  viewId?: string;
  fieldNames?: string[];
}

interface FetchResult {
  data: LarkRecord[];
  total: number;
  hasMore: boolean;
  pageToken?: string | undefined;
}

/** Filter condition tuple: [fieldName, operator, value]
 *  Operators: ==, !=, >, <, >=, <=, intersects, contains, is_empty, non_empty */
export type FilterCondition = [string, string, unknown];

/** Sort directive: { field: string, desc?: boolean } */
export interface SortDirective {
  field: string;
  desc?: boolean;
}

/** Query options for server-side filter + sort via --filter-json and --sort-json.
 *  More powerful than static views — runtime conditions, dynamic sorting. */
export interface QueryOptions {
  pageSize?: number;
  pageToken?: string;
  viewId?: string;
  fieldNames?: string[];
  /** Filter conditions — combined with AND logic.
   *  Example: [["Follower", ">", 100000], ["KOLs Type", "==", "Creator"]] */
  filter?: FilterCondition[];
  /** Sort directives — priority follows array order (max 10).
   *  Example: [{ field: "Follower", desc: true }] */
  sort?: SortDirective[];
}

interface CliRecordListResponse {
  ok: boolean;
  data?: {
    data: unknown[][];
    field_id_list: string[];
    total?: number;
    has_more?: boolean;
    page_token?: string;
  };
  error?: { type: string; code?: number; message: string; hint?: string };
}

// ─── Core: execute lark-cli ─────────────────────────────────────────────────

export type OutputFormat = "json" | "markdown";

interface ExecOptions {
  format?: OutputFormat;
  jq?: string;
  dryRun?: boolean;
}

function execLarkCli(args: string[], opts: ExecOptions = {}): unknown {
  const cmdArgs = [...args, "--format", "json"];
  if (opts.jq) cmdArgs.push("--jq", opts.jq);
  if (opts.dryRun) cmdArgs.push("--dry-run");

  // Try system lark-cli first, fall back to npm-installed version
  let cmd: string;
  try {
    execSync("which lark-cli", { stdio: "pipe" });
    cmd = `lark-cli ${cmdArgs.join(" ")} 2>&1`;
  } catch {
    // Use npm-installed lark-cli via run.js script
    const runScript = join(process.cwd(), "node_modules", "@larksuite", "cli", "scripts", "run.js");
    cmd = `node ${runScript} ${cmdArgs.join(" ")} 2>&1`;
  }

  const stdout = execSync(cmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  return JSON.parse(stdout);
}

/** Preview a lark-cli command without executing it.
 *  Returns the API request that would be sent. */
export function dryRun(args: string[]): unknown {
  return execLarkCli(args, { dryRun: true });
}

function buildFieldMap(
  fieldIds: string[],
  row: unknown[],
  idToName: Map<string, string>
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (let i = 0; i < fieldIds.length; i++) {
    const name = idToName.get(fieldIds[i]);
    if (name) fields[name] = row[i];
  }
  return fields;
}

function convertRow(
  fieldIds: string[],
  row: unknown[],
  idToName: Map<string, string>
): LarkRecord {
  return { record_id: String(row[0] ?? ""), fields: buildFieldMap(fieldIds, row, idToName) };
}

// ─── Schema cache: ONE +table-get per table ─────────────────────────────────

const schemaCache = new Map<string, TableSchema>();

export function getTableSchema(tableId: TableId): TableSchema {
  const cached = schemaCache.get(tableId);
  if (cached) return cached;

  const res = execLarkCli([
    "base", "+table-get", "--base-token", BASE_TOKEN, "--table-id", tableId,
  ]) as {
    ok: boolean;
    data?: {
      table_id?: string;
      name?: string;
      table?: { name?: string };
      fields?: Array<{ id: string; name: string; type: string }>;
    };
    error?: { message: string };
  };

  if (!res.ok || !res.data?.fields) {
    throw new Error(`Failed to get schema for table ${tableId}: ${res.error?.message ?? "unknown"}`);
  }

  const fieldNameToId = new Map<string, string>();
  const fieldIdToName = new Map<string, string>();
  const fieldTypeMap = new Map<string, string>();
  for (const f of res.data.fields) {
    fieldNameToId.set(f.name, f.id);
    fieldIdToName.set(f.id, f.name);
    fieldTypeMap.set(f.name, f.type);
  }

  const schema: TableSchema = {
    tableId: res.data.table_id ?? tableId,
    tableName: res.data.table?.name ?? res.data.name ?? tableId,
    fields: res.data.fields,
    fieldNameToId,
    fieldIdToName,
    fieldTypeMap,
  };

  schemaCache.set(tableId, schema);
  return schema;
}

export function resolveFieldIds(tableId: TableId, fieldNames: string[]): string[] {
  const schema = getTableSchema(tableId);
  return fieldNames.map((name) => schema.fieldNameToId.get(name) ?? name).filter(Boolean);
}

export function resolveFieldNames(tableId: TableId, fieldIds: string[]): string[] {
  const schema = getTableSchema(tableId);
  return fieldIds.map((id) => schema.fieldIdToName.get(id) ?? id);
}

// ─── Record read ────────────────────────────────────────────────────────────

export async function fetchRecords(tableId: TableId, opts: FetchOptions = {}): Promise<FetchResult> {
  const args = ["base", "+record-list", "--base-token", BASE_TOKEN, "--table-id", tableId];
  if (opts.viewId) args.push("--view-id", opts.viewId);
  if (opts.fieldNames?.length) {
    for (const id of resolveFieldIds(tableId, opts.fieldNames)) args.push("--field-id", id);
  }
  if (opts.pageSize) args.push("--limit", String(Math.min(opts.pageSize, 200)));
  if (opts.pageToken) args.push("--offset", opts.pageToken);

  const res = execLarkCli(args) as CliRecordListResponse;
  if (!res.ok || !res.data) {
    console.error("[LarkCLI] fetchRecords error:", res.error);
    return { data: [], total: 0, hasMore: false };
  }

  const { data: rows, field_id_list: fieldIds, total, has_more, page_token } = res.data;
  const schema = getTableSchema(tableId);
  return {
    data: rows.map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName)),
    total: total ?? rows.length,
    hasMore: has_more ?? false,
    pageToken: page_token,
  };
}

export async function fetchAllRecords(
  tableId: TableId,
  opts: Omit<FetchOptions, "pageSize" | "pageToken"> & { viewId?: string } = {}
): Promise<LarkRecord[]> {
  const all: LarkRecord[] = [];
  let offset = 0;

  while (true) {
    const args = [
      "base", "+record-list", "--base-token", BASE_TOKEN, "--table-id", tableId,
      "--limit", "200", "--offset", String(offset),
    ];
    if (opts.viewId) args.push("--view-id", opts.viewId);
    if (opts.fieldNames?.length) {
      for (const id of resolveFieldIds(tableId, opts.fieldNames)) args.push("--field-id", id);
    }

    const res = execLarkCli(args) as CliRecordListResponse;
    if (!res.ok || !res.data) {
      console.error("[LarkCLI] fetchAllRecords error:", res.error);
      break;
    }

    const { data: rows, field_id_list: fieldIds, has_more } = res.data;
    const schema = getTableSchema(tableId);
    all.push(...rows.map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName)));
    if (!has_more) break;
    offset += rows.length;
  }
  return all;
}

/** Filter + sort records server-side via --filter-json and --sort-json.
 *  More powerful than static views — runtime conditions, dynamic sorting.
 *
 *  @example
 *    filterRecords(TABLES.ALL_KOLS, {
 *      fieldNames: ["Nickname", "Handle", "Follower"],
 *      filter: [["Follower", ">", 100000], ["KOLs Type", "==", "Creator"]],
 *      sort: [{ field: "Follower", desc: true }],
 *      pageSize: 10,
 *    })
 */
export async function filterRecords(
  tableId: TableId,
  opts: QueryOptions = {}
): Promise<FetchResult> {
  const args = ["base", "+record-list", "--base-token", BASE_TOKEN, "--table-id", tableId];

  if (opts.viewId) args.push("--view-id", opts.viewId);
  if (opts.fieldNames?.length) {
    for (const id of resolveFieldIds(tableId, opts.fieldNames)) args.push("--field-id", id);
  }
  if (opts.pageSize) args.push("--limit", String(Math.min(opts.pageSize, 200)));
  if (opts.pageToken) args.push("--offset", opts.pageToken);

  // Build filter JSON
  if (opts.filter?.length) {
    const filterJson = {
      logic: "and",
      conditions: opts.filter,
    };
    args.push("--filter-json", JSON.stringify(filterJson));
  }

  // Build sort JSON
  if (opts.sort?.length) {
    const sortJson = opts.sort.map((s) => ({ field: s.field, desc: s.desc ?? false }));
    args.push("--sort-json", JSON.stringify(sortJson));
  }

  const res = execLarkCli(args) as CliRecordListResponse;
  if (!res.ok || !res.data) {
    console.error("[LarkCLI] filterRecords error:", res.error);
    return { data: [], total: 0, hasMore: false };
  }

  const { data: rows, field_id_list: fieldIds, total, has_more, page_token } = res.data;
  const schema = getTableSchema(tableId);
  return {
    data: rows.map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName)),
    total: total ?? rows.length,
    hasMore: has_more ?? false,
    pageToken: page_token,
  };
}

/** Filter + sort ALL records (auto-paginated). */
export async function filterAllRecords(
  tableId: TableId,
  opts: Omit<QueryOptions, "pageSize" | "pageToken"> = {}
): Promise<LarkRecord[]> {
  const all: LarkRecord[] = [];
  let offset = 0;

  while (true) {
    const res = await filterRecords(tableId, {
      ...opts,
      pageSize: 200,
      pageToken: String(offset),
    });
    all.push(...res.data);
    if (!res.hasMore) break;
    offset += res.data.length;
  }
  return all;
}

export async function searchRecords(
  tableId: TableId,
  keyword: string,
  opts: { searchFields?: string[]; selectFields?: string[]; limit?: number } = {}
): Promise<FetchResult> {
  const searchJson: Record<string, unknown> = {
    keyword,
    search_fields: opts.searchFields ?? [],
    limit: opts.limit ?? 50,
    offset: 0,
  };
  if (opts.selectFields?.length) searchJson["select_fields"] = resolveFieldIds(tableId, opts.selectFields);

  const res = execLarkCli([
    "base", "+record-search", "--base-token", BASE_TOKEN, "--table-id", tableId,
    "--json", JSON.stringify(searchJson),
  ]) as CliRecordListResponse;

  if (!res.ok || !res.data) {
    console.error("[LarkCLI] searchRecords error:", res.error);
    return { data: [], total: 0, hasMore: false };
  }

  const { data: rows, field_id_list: fieldIds, total, has_more } = res.data;
  const schema = getTableSchema(tableId);
  return {
    data: rows.map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName)),
    total: total ?? rows.length,
    hasMore: has_more ?? false,
  };
}

export async function getRecordsById(
  tableId: TableId,
  recordIds: string[],
  opts: { fieldNames?: string[] } = {}
): Promise<LarkRecord[]> {
  if (recordIds.length === 0) return [];

  const args = ["base", "+record-get", "--base-token", BASE_TOKEN, "--table-id", tableId];
  for (const id of recordIds) args.push("--record-id", id);
  if (opts.fieldNames?.length) {
    for (const id of resolveFieldIds(tableId, opts.fieldNames)) args.push("--field-id", id);
  }

  const res = execLarkCli(args) as CliRecordListResponse;
  if (!res.ok || !res.data) {
    console.error("[LarkCLI] getRecordsById error:", res.error);
    return [];
  }

  const { data: rows, field_id_list: fieldIds } = res.data;
  const schema = getTableSchema(tableId);
  return rows.map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName));
}

// ─── Unified query router ───────────────────────────────────────────────────

export type QueryStrategy = "view" | "search" | "list";

export interface UnifiedQueryOptions {
  strategy?: QueryStrategy;
  viewId?: string;
  keyword?: string;
  searchFields?: string[];
  fieldNames?: string[];
  pageSize?: number;
  pageToken?: string;
}

export async function queryRecords(
  tableId: TableId,
  opts: UnifiedQueryOptions = {}
): Promise<FetchResult> {
  const strategy = opts.strategy ?? (opts.viewId ? "view" : opts.keyword ? "search" : "list");

  switch (strategy) {
    case "view": {
      if (!opts.viewId) throw new Error("view strategy requires viewId");
      const viewOpts: FetchOptions = { viewId: opts.viewId };
      if (opts.fieldNames !== undefined) viewOpts.fieldNames = opts.fieldNames;
      if (opts.pageSize !== undefined) viewOpts.pageSize = opts.pageSize;
      if (opts.pageToken !== undefined) viewOpts.pageToken = opts.pageToken;
      return fetchRecords(tableId, viewOpts);
    }

    case "search": {
      if (!opts.keyword) throw new Error("search strategy requires keyword");
      const searchOpts: { searchFields?: string[]; selectFields?: string[]; limit: number } = { limit: opts.pageSize ?? 50 };
      if (opts.searchFields !== undefined) searchOpts.searchFields = opts.searchFields;
      if (opts.fieldNames !== undefined) searchOpts.selectFields = opts.fieldNames;
      return searchRecords(tableId, opts.keyword, searchOpts);
    }

    case "list":
    default: {
      const listOpts: FetchOptions = {};
      if (opts.fieldNames !== undefined) listOpts.fieldNames = opts.fieldNames;
      if (opts.pageSize !== undefined) listOpts.pageSize = opts.pageSize;
      if (opts.pageToken !== undefined) listOpts.pageToken = opts.pageToken;
      return fetchRecords(tableId, listOpts);
    }
  }
}

// ─── Dashboard data ─────────────────────────────────────────────────────────
//
// NOTE: Dashboard blocks (+dashboard-block-get-data) are unreliable — they
// reference deleted fields and return 4400 errors. All dashboard data comes
// from the DASHBOARD_SUMMARY table (tblOwkSqf5rci6zq) which has pre-computed
// KPIs by period and dashboard type.
//
// Schema: Period | Dashboard Type | Metric Key | Metric Label | Metric Value |
//         Metric Unit | Change | Trend
//
// Periods: 2025-11, 2025-12, 2026-01, 2026-02, 2026-04
// Types: overview (6 metrics), performance (5), gmv (5), engagement (5)

/** Load all dashboard KPIs for a given type + period from DASHBOARD_SUMMARY.
 *  Returns empty array if no match. */
export async function getDashboardKPIs(
  dashboardType: string,
  period?: string
): Promise<Array<{
  metricKey: string;
  metricLabel: string;
  metricValue: number;
  metricUnit: string;
  change: number;
  trend: "up" | "down" | "neutral";
  period: string;
}>> {
  const args = [
    "base", "+record-list", "--base-token", BASE_TOKEN,
    "--table-id", TABLES.DASHBOARD_SUMMARY,
    "--field-id", "Period", "--field-id", "Dashboard Type",
    "--field-id", "Metric Key", "--field-id", "Metric Label",
    "--field-id", "Metric Value", "--field-id", "Metric Unit",
    "--field-id", "Change", "--field-id", "Trend",
    "--limit", "200",
  ];

  const res = execLarkCli(args) as CliRecordListResponse;
  if (!res.ok || !res.data) {
    console.error("[LarkCLI] getDashboardKPIs error:", res.error);
    return [];
  }

  const schema = getTableSchema(TABLES.DASHBOARD_SUMMARY);
  const { data: rows, field_id_list: fieldIds } = res.data;

  return rows
    .map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName))
    .filter((r) => str(r.fields, "Dashboard Type") === dashboardType)
    .filter((r) => !period || str(r.fields, "Period") === period)
    .map((r) => ({
      metricKey: str(r.fields, "Metric Key"),
      metricLabel: str(r.fields, "Metric Label"),
      metricValue: num(r.fields, "Metric Value"),
      metricUnit: str(r.fields, "Metric Unit"),
      change: num(r.fields, "Change"),
      trend: (str(r.fields, "Trend") as "up" | "down" | "neutral") || "neutral",
      period: str(r.fields, "Period"),
    }));
}

/** Get distinct periods available in DASHBOARD_SUMMARY, newest first. */
export async function getDashboardPeriods(): Promise<string[]> {
  const args = [
    "base", "+record-list", "--base-token", BASE_TOKEN,
    "--table-id", TABLES.DASHBOARD_SUMMARY,
    "--field-id", "Period",
    "--limit", "200",
  ];

  const res = execLarkCli(args) as CliRecordListResponse;
  if (!res.ok || !res.data) {
    console.error("[LarkCLI] getDashboardPeriods error:", res.error);
    return [];
  }

  const schema = getTableSchema(TABLES.DASHBOARD_SUMMARY);
  const { data: rows, field_id_list: fieldIds } = res.data;

  const periods = Array.from(new Set(
    rows
      .map((row) => convertRow(fieldIds, row as unknown[], schema.fieldIdToName))
      .map((r) => str(r.fields, "Period"))
      .filter(Boolean)
  )).sort().reverse();

  return periods;
}

/** Get the latest period from DASHBOARD_SUMMARY. */
export async function getLatestDashboardPeriod(): Promise<string | null> {
  const periods = await getDashboardPeriods();
  return periods[0] ?? null;
}

// ─── Deprecated dashboard block helpers ─────────────────────────────────────
// These are kept for backward compatibility but return null/empty.
// Dashboard blocks reference deleted fields and fail with 4400 errors.

/** @deprecated Use getDashboardKPIs() instead. Dashboard blocks are broken. */
export async function getDashboardMetric(_blockId: string): Promise<number | null> {
  console.warn("[LarkCLI] getDashboardMetric is deprecated — dashboard blocks reference deleted fields");
  return null;
}

/** @deprecated Use getDashboardKPIs() instead. Dashboard blocks are broken. */
export async function getDashboardChartSeries(_blockId: string): Promise<Array<{ label: string; value: number }>> {
  console.warn("[LarkCLI] getDashboardChartSeries is deprecated — dashboard blocks reference deleted fields");
  return [];
}

// ─── Semantic query layer (group / aggregate / compute) ─────────────────────
//
// +data-query DSL is BROKEN upstream (800004006). These helpers do
// client-side aggregation on efficiently-filtered record sets.
//
// Design: ONE fetch with projection → group/aggregate in memory.
// Much faster than N+1 API calls or fetching unneeded fields.

export interface AggregateResult {
  group: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

/** Group records by a field and compute aggregates on another field.
 *  Example: groupByField(records, "KOLs Type", "Follower")
 *  → [{group:"Creator", count:45, sum:1.2M, avg:27k, min:1k, max:500k}, ...] */
export function groupByField(
  records: LarkRecord[],
  groupField: string,
  valueField: string
): AggregateResult[] {
  const groups = new Map<string, number[]>();

  for (const r of records) {
    const groupKey = str(r.fields, groupField);
    if (!groupKey) continue;
    const val = num(r.fields, valueField);
    const arr = groups.get(groupKey) ?? [];
    arr.push(val);
    groups.set(groupKey, arr);
  }

  return Array.from(groups.entries())
    .map(([group, values]) => {
      const sum = values.reduce((a, b) => a + b, 0);
      return {
        group,
        count: values.length,
        sum,
        avg: values.length > 0 ? sum / values.length : 0,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
      };
    })
    .sort((a, b) => b.sum - a.sum);
}

/** Count records by a field value (frequency distribution).
 *  Example: countByField(records, "Platform")
 *  → [{value:"TikTok", count:280}, {value:"Instagram", count:35}, ...] */
export function countByField(
  records: LarkRecord[],
  field: string
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const r of records) {
    const v = str(r.fields, field);
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/** Compute percentile for a numeric field.
 *  Returns {p50, p90, p95, p99} for distribution analysis. */
export function percentile(
  records: LarkRecord[],
  field: string
): { p50: number; p90: number; p95: number; p99: number; count: number } {
  const values = records
    .map((r) => num(r.fields, field))
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0, count: 0 };

  const at = (p: number) => {
    const idx = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(idx, values.length - 1))];
  };

  return { p50: at(50), p90: at(90), p95: at(95), p99: at(99), count: values.length };
}

/** Top N records by a numeric field.
 *  Example: topN(records, "Follower", 10) → top 10 by follower count. */
export function topN(
  records: LarkRecord[],
  field: string,
  n: number,
  desc = true
): LarkRecord[] {
  return [...records]
    .sort((a, b) => {
      const diff = num(a.fields, field) - num(b.fields, field);
      return desc ? -diff : diff;
    })
    .slice(0, n);
}

// ─── Field-type-aware query validator ───────────────────────────────────────

/** Valid operators per field type for --filter-json */
const VALID_OPERATORS: Record<string, string[]> = {
  text: ["==", "!=", "intersects", "contains", "is_empty", "non_empty"],
  number: ["==", "!=", ">", "<", ">=", "<=", "is_empty", "non_empty"],
  formula: ["==", "!=", ">", "<", ">=", "<=", "is_empty", "non_empty"],
  select: ["==", "!=", "intersects", "is_empty", "non_empty"],
  multi_select: ["intersects", "is_empty", "non_empty"],
  datetime: ["==", "!=", ">", "<", ">=", "<=", "is_empty", "non_empty"],
  checkbox: ["==", "is_empty", "non_empty"],
  attachment: ["is_empty", "non_empty"],
  link: ["is_empty", "non_empty"],
  phone: ["==", "!=", "contains", "is_empty", "non_empty"],
  url: ["==", "!=", "contains", "is_empty", "non_empty"],
};

/** Validate filter conditions against field types.
 *  Returns {valid, errors} — errors list incompatible operator/field pairs. */
export function validateFilterConditions(
  tableId: TableId,
  conditions: FilterCondition[]
): { valid: boolean; errors: string[] } {
  const schema = getTableSchema(tableId);
  const errors: string[] = [];

  for (const [fieldName, operator] of conditions) {
    const fieldType = schema.fieldTypeMap.get(fieldName);
    if (!fieldType) {
      errors.push(`Unknown field: "${fieldName}"`);
      continue;
    }
    const validOps = VALID_OPERATORS[fieldType] ?? VALID_OPERATORS["text"];
    if (!validOps.includes(operator)) {
      errors.push(`Invalid operator "${operator}" for field "${fieldName}" (type: ${fieldType}). Valid: ${validOps.join(", ")}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Get field type for a field name. Returns "unknown" if not found. */
export function getFieldType(tableId: TableId, fieldName: string): string {
  const schema = getTableSchema(tableId);
  return schema.fieldTypeMap.get(fieldName) ?? "unknown";
}

/** Check if a field is numeric (number, formula, rating, percent, currency). */
export function isNumericField(tableId: TableId, fieldName: string): boolean {
  const type = getFieldType(tableId, fieldName);
  return ["number", "formula", "rating", "percent", "currency"].includes(type);
}

/** Check if a field is a select/multi-select. */
export function isOptionField(tableId: TableId, fieldName: string): boolean {
  const type = getFieldType(tableId, fieldName);
  return ["select", "multi_select"].includes(type);
}

// ─── Field helpers ──────────────────────────────────────────────────────────

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
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    const val = (v as { value?: unknown[] }).value;
    if (Array.isArray(val) && val.length > 0) {
      const n = Number(val[0]);
      return Number.isFinite(n) ? n : 0;
    }
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

export function isValidAttachment(v: unknown): v is LarkAttachment {
  if (typeof v !== "object" || v === null) return false;
  const a = v as Record<string, unknown>;
  return typeof a["file_token"] === "string" && typeof a["name"] === "string";
}

export function attachments(fields: Record<string, unknown>, key: string): LarkAttachment[] {
  const v = fields[key];
  return Array.isArray(v) ? v.filter(isValidAttachment) : [];
}

// ─── Attachment resolution ──────────────────────────────────────────────────

/** Download attachments for ONE record. Use resolveRecordAttachments for batch. */
export async function downloadAttachments(
  tokens: string[],
  tableId: string,
  recordId: string,
  opts: { outputDir?: string; overwrite?: boolean } = {}
): Promise<Record<string, { path: string; name: string; contentType?: string }>> {
  if (tokens.length === 0) return {};

  const outputDir = opts.outputDir ?? join(tmpdir(), `lark-att-${Date.now()}`);
  mkdirSync(outputDir, { recursive: true });

  const result: Record<string, { path: string; name: string; contentType?: string }> = {};

  for (const token of tokens) {
    try {
      const res = execLarkCli([
        "base", "+record-download-attachment",
        "--base-token", BASE_TOKEN, "--table-id", tableId, "--record-id", recordId,
        "--file-token", token, "--output", outputDir,
        ...(opts.overwrite ? ["--overwrite"] : []),
      ]) as {
        ok: boolean;
        data?: { downloaded?: Array<{ file_token: string; name: string; saved_path: string; content_type?: string }> };
      };

      if (res.ok && res.data?.downloaded) {
        for (const f of res.data.downloaded) {
          const entry: { path: string; name: string; contentType?: string } = { path: f.saved_path, name: f.name };
          if (f.content_type !== undefined) entry.contentType = f.content_type;
          result[f.file_token] = entry;
        }
      }
    } catch (e) {
      console.error(`[LarkCLI] download attachment failed for ${token}:`, e);
    }
  }

  return result;
}

/** Batch-resolve attachment URLs for multiple records in ONE lark-cli call.
 *  Uses +record-download-attachment with multiple --file-token flags per record.
 *  Much faster than per-record loops (one subprocess per record vs one per batch). */
export async function resolveRecordAttachments(
  records: LarkRecord[],
  options: { tableId: string; fieldName: string; filter?: (a: LarkAttachment) => boolean }
): Promise<Map<string, { token: string; url: string; name: string }[]>> {
  const { tableId, fieldName, filter } = options;
  const result = new Map<string, { token: string; url: string; name: string }[]>();

  // Collect all (recordId, token, name) tuples that need downloading
  const tasks: Array<{ recordId: string; token: string; name: string }> = [];
  for (const r of records) {
    let refs = attachments(r.fields, fieldName);
    if (filter) refs = refs.filter(filter);
    for (const a of refs) tasks.push({ recordId: r.record_id, token: a.file_token, name: a.name });
  }
  if (tasks.length === 0) return result;

  // Group by recordId for batch download
  const byRecord = new Map<string, string[]>();
  for (const t of tasks) {
    const arr = byRecord.get(t.recordId) ?? [];
    arr.push(t.token);
    byRecord.set(t.recordId, arr);
  }

  const outputDir = join(tmpdir(), `lark-att-${Date.now()}`);
  mkdirSync(outputDir, { recursive: true });

  // Download all attachments in batches per record
  const downloaded = new Map<string, { path: string; name: string }>();
  for (const [recordId, tokens] of byRecord) {
    try {
      const args = [
        "base", "+record-download-attachment",
        "--base-token", BASE_TOKEN, "--table-id", tableId, "--record-id", recordId,
        "--output", outputDir, "--format", "json",
      ];
      for (const t of tokens) args.push("--file-token", t);

      const res = execLarkCli(args) as {
        ok: boolean;
        data?: { downloaded?: Array<{ file_token: string; name: string; saved_path: string }> };
      };

      if (res.ok && res.data?.downloaded) {
        for (const f of res.data.downloaded) {
          downloaded.set(f.file_token, { path: f.saved_path, name: f.name });
        }
      }
    } catch (e) {
      console.error(`[LarkCLI] batch download failed for ${recordId}:`, e);
    }
  }

  // Map back to result by recordId
  for (const r of records) {
    let refs = attachments(r.fields, fieldName);
    if (filter) refs = refs.filter(filter);
    if (!refs.length) continue;
    result.set(
      r.record_id,
      refs.flatMap((a) => {
        const d = downloaded.get(a.file_token);
        return d ? [{ token: a.file_token, url: d.path, name: d.name }] : [];
      })
    );
  }

  return result;
}

// ─── Record mutations ───────────────────────────────────────────────────────

export interface BatchUpdateRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export async function upsertRecord(
  tableId: TableId,
  recordId: string,
  fields: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = execLarkCli([
      "base", "+record-upsert", "--base-token", BASE_TOKEN, "--table-id", tableId,
      "--record-id", recordId, "--json", JSON.stringify(fields),
    ]) as { ok: boolean; error?: { message: string } };

    if (res.ok) return { success: true };
    return { success: false, error: res.error?.message ?? "upsert failed" };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function createRecords(
  tableId: TableId,
  records: Array<{ fields: Record<string, unknown> }>
): Promise<{ success: boolean; created?: number; error?: string }> {
  if (records.length === 0) return { success: true, created: 0 };

  const schema = getTableSchema(tableId);
  const fieldNames = Array.from(new Set(records.flatMap((r) => Object.keys(r.fields))));
  const fieldIds = fieldNames.map((name) => schema.fieldNameToId.get(name) ?? name);
  const rows = records.map((r) => fieldNames.map((name) => r.fields[name] ?? null));

  try {
    const res = execLarkCli([
      "base", "+record-batch-create", "--base-token", BASE_TOKEN, "--table-id", tableId,
      "--json", JSON.stringify({ fields: fieldIds, rows }),
    ]) as { ok: boolean; data?: { records?: unknown[] }; error?: { message: string } };

    if (res.ok) return { success: true, created: res.data?.records?.length ?? records.length };
    return { success: false, error: res.error?.message ?? "batch create failed" };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function batchUpdateRecords(
  tableId: TableId,
  recordIds: string[],
  patch: Record<string, unknown>
): Promise<{ success: boolean; updated?: number; error?: string }> {
  if (recordIds.length === 0) return { success: true, updated: 0 };

  try {
    const res = execLarkCli([
      "base", "+record-batch-update", "--base-token", BASE_TOKEN, "--table-id", tableId,
      "--json", JSON.stringify({ record_id_list: recordIds, patch }),
    ]) as { ok: boolean; data?: { records?: unknown[] }; error?: { message: string } };

    if (res.ok) return { success: true, updated: res.data?.records?.length ?? recordIds.length };
    return { success: false, error: res.error?.message ?? "batch update failed" };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteRecords(
  tableId: TableId,
  recordIds: string[]
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  if (recordIds.length === 0) return { success: true, deleted: 0 };

  try {
    const res = execLarkCli([
      "base", "+record-delete", "--base-token", BASE_TOKEN, "--table-id", tableId,
      "--json", JSON.stringify({ record_id_list: recordIds }), "--yes",
    ]) as { ok: boolean; data?: { records?: unknown[] }; error?: { message: string } };

    if (res.ok) return { success: true, deleted: res.data?.records?.length ?? recordIds.length };
    return { success: false, error: res.error?.message ?? "delete failed" };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ─── View metadata ──────────────────────────────────────────────────────────

export interface LarkView {
  view_id: string;
  view_name: string;
  view_type: string;
  property?: {
    filter_info?: {
      conjunction?: string;
      conditions?: Array<{
        condition_id: string;
        field_id: string;
        field_type: number;
        operator: string;
        value: string;
        condition_omitted?: boolean;
      }>;
      condition_omitted?: boolean | null;
    };
    hidden_fields?: string[] | null;
  } | undefined;
}

export async function fetchView(tableId: TableId, viewId: string): Promise<LarkView | null> {
  try {
    const res = execLarkCli([
      "base", "+view-get", "--base-token", BASE_TOKEN, "--table-id", tableId, "--view-id", viewId,
    ]) as {
      ok: boolean;
      data?: { view?: { view_id: string; view_name: string; view_type: string; property?: LarkView["property"] } };
      error?: { message: string };
    };

    if (!res.ok || !res.data?.view) {
      console.error("[LarkCLI] fetchView error:", res.error);
      return null;
    }

    const v = res.data.view;
    return { view_id: v.view_id, view_name: v.view_name, view_type: v.view_type, property: v.property };
  } catch (e) {
    console.error("[LarkCLI] fetchView exception:", e);
    return null;
  }
}

export async function fetchViewFilter(tableId: TableId, viewId: string) {
  try {
    const res = execLarkCli([
      "base", "+view-get-filter", "--base-token", BASE_TOKEN, "--table-id", tableId, "--view-id", viewId,
    ]) as { ok: boolean; data?: { filter?: unknown }; error?: { message: string } };

    if (!res.ok) { console.error("[LarkCLI] fetchViewFilter error:", res.error); return null; }
    return res.data?.filter ?? null;
  } catch (e) {
    console.error("[LarkCLI] fetchViewFilter exception:", e);
    return null;
  }
}

export async function fetchViewVisibleFields(tableId: TableId, viewId: string): Promise<string[] | null> {
  try {
    const res = execLarkCli([
      "base", "+view-get-visible-fields", "--base-token", BASE_TOKEN, "--table-id", tableId, "--view-id", viewId,
    ]) as { ok: boolean; data?: { visible_fields?: string[] }; error?: { message: string } };

    if (!res.ok) { console.error("[LarkCLI] fetchViewVisibleFields error:", res.error); return null; }
    return res.data?.visible_fields ?? null;
  } catch (e) {
    console.error("[LarkCLI] fetchViewVisibleFields exception:", e);
    return null;
  }
}

export async function listViews(tableId: TableId) {
  try {
    const res = execLarkCli([
      "base", "+view-list", "--base-token", BASE_TOKEN, "--table-id", tableId,
    ]) as { ok: boolean; data?: { views?: Array<{ id: string; name: string; type: string }> }; error?: { message: string } };

    if (!res.ok) { console.error("[LarkCLI] listViews error:", res.error); return []; }
    return res.data?.views ?? [];
  } catch (e) {
    console.error("[LarkCLI] listViews exception:", e);
    return [];
  }
}
