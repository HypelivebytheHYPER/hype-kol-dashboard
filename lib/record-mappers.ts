// Transform raw Lark records into typed domain objects and collapse multi-row
// creators down to one entry per KOL.

import { unstable_cache } from "next/cache";
import {
  str, num, arr, url, resolveRecordAttachments,
  fetchAllRecords, TABLES, VIEWS, type LarkRecord,
  getDashboardKPIs, getDashboardPeriods, getLatestDashboardPeriod,
} from "./lark-cli-bridge";
import { normalizeCategories, CATEGORY_FIELD } from "./taxonomy";
import type { Creator, DashboardMetric, Studio } from "./types";

/* ── KOL Record Parsing ─────────────────────────────────────────────── */

/** Extract TikTok handle from a profile URL like https://www.tiktok.com/@username */
export function extractTikTokHandleFromUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    const match = u.pathname.match(/^\/@([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

// Platform field is a Formula returning SingleSelect option IDs
const PLATFORM_MAP: Record<string, string> = {
  optzonmtE3: "TikTok",
  optPtaoZFs: "Other",
  optbMWso1S: "YouTube",
  optBJjwUkb: "Instagram",
  optBucpYlz: "X",
  optlFXdXnO: "Facebook",
};

function recordToCreator(r: LarkRecord): Creator {
  const f = r.fields;
  const accountType = str(f, "Account Type");
  const fee = num(f, "Fee");

  // The "Handle" field is often an internal ID, not the TikTok handle.
  // The actual TikTok handle is in the Channel URL: https://www.tiktok.com/@realhandle
  const channelUrl = url(f, "Channel");
  const tiktokHandleFromUrl = channelUrl ? extractTikTokHandleFromUrl(channelUrl) : null;
  const rawHandle = str(f, "Handle");

  const creator: Creator = {
    id: r.record_id,
    kolId: str(f, "Record ID") || r.record_id,
    name: str(f, "Nickname") || rawHandle,
    handle: tiktokHandleFromUrl || rawHandle,
    platform: PLATFORM_MAP[str(f, "Platform")] || str(f, "Platform"),
    tier: str(f, "Levels of KOLs"),
    followers: num(f, "Follower"),
    engagementRate: num(f, "Engagement Rate"),
    avgGMV: num(f, "Avg_Monthly_GMV_Numeric"),
    avgLiveGMV: num(f, "Avg_Live_GMV_Numeric"),
    qualityScore: num(f, "Quality Score"),
    categories: normalizeCategories(arr(f, CATEGORY_FIELD)),
    location: arr(f, "Location").join(", "),
    kolType: str(f, "KOLs Type"),
    contact: { lineId: str(f, "LineId"), phone: str(f, "Phone"), email: str(f, "Contact_Email") },
    stats: {
      liveGmv: num(f, "LiveGmv"), videoGmv: num(f, "VideoGmv"), revenue: num(f, "Revenue"),
      views: num(f, "Views"), productCount: num(f, "ProductCount"),
      liveNum: num(f, "LiveNum"), videoNum: num(f, "VideoNum"),
      ...(num(f, "Likes") > 0 && { likes: num(f, "Likes") }),
      ...(num(f, "Comments") > 0 && { comments: num(f, "Comments") }),
      ...(num(f, "Shares") > 0 && { shares: num(f, "Shares") }),
      ...(num(f, "Saves") > 0 && { saves: num(f, "Saves") }),
    },
    bio: { th: str(f, "Bio_TH"), en: str(f, "Bio_EN") },
    condition: str(f, "Condition"),
    scope: str(f, "Scope"),
    sourceUrl: url(f, "SourceUrl"),
    channel: url(f, "Channel"),
    fees: fee > 0 ? { min: fee, max: fee, count: 1 } : null,
  };
  if (accountType) creator.accountType = accountType;

  const profilePhotoUrl = ["Profile Photo URL", "Avatar URL", "Profile Image", "Photo", "Image"]
    .map((k) => str(f, k))
    .find(Boolean);
  if (profilePhotoUrl) creator.image = profilePhotoUrl;

  return creator;
}

/** Lark stores one row per fee package, so the same creator spans multiple rows.
 *  Groups by handle, picks highest-revenue as primary, aggregates fees.
 *  Returns `byId` as a plain Record (JSON-serializable for Next.js cache).
 *
 *  Private — consumers should use `loadKOLCatalog` or `loadKOLProfile`. */
function dedupeCreators(creators: Creator[]): {
  creators: Creator[];
  byId: Record<string, Creator>;
} {
  const groups = new Map<string, Creator[]>();
  for (const c of creators) {
    const key = (c.handle || c.name || c.id).toLowerCase();
    const existing = groups.get(key);
    if (existing) existing.push(c);
    else groups.set(key, [c]);
  }

  const merged: Creator[] = [];
  const byId: Record<string, Creator> = {};
  for (const group of groups.values()) {
    const primary = group.length === 1
      ? group[0]!
      : group.reduce((best, c) =>
          c.stats.revenue > best.stats.revenue
            ? c
            : c.stats.revenue === best.stats.revenue && c.followers > best.followers
              ? c
              : best
        );
    const fees = group.map((c) => c.fees?.min ?? 0).filter((f) => f > 0);
    const mergedCreator: Creator = {
      ...primary,
      fees: fees.length
        ? { min: Math.min(...fees), max: Math.max(...fees), count: fees.length }
        : null,
    };
    merged.push(mergedCreator);
    for (const c of group) byId[c.id] = mergedCreator;
  }
  return { creators: merged, byId };
}

/** One-shot transform: raw Lark records → merged catalog. */
export function parseKOLRecords(records: LarkRecord[]) {
  return dedupeCreators(records.map(recordToCreator));
}

/* ── Cached Loaders (Next.js Data Cache) ────────────────────────────── */

/** Load the full KOL catalog (list view).
 *  Cached via Next.js unstable_cache — survives across requests, cold starts,
 *  and Vercel edge regions. Revalidates every 5 minutes. */
/** Fields needed for Creator parsing — projection reduces payload vs fetching all 36 fields. */
const KOL_CORE_FIELDS = [
  "Record ID", "Nickname", "Handle", "Platform", "Levels of KOLs",
  "Follower", "Engagement Rate", "Avg_Monthly_GMV_Numeric", "Avg_Live_GMV_Numeric",
  "Quality Score", "Inferred Categories", "Location", "KOLs Type",
  "LineId", "Phone", "Contact_Email", "LiveGmv", "VideoGmv", "Revenue",
  "Views", "ProductCount", "LiveNum", "VideoNum", "Likes", "Comments",
  "Shares", "Saves", "Bio_EN", "Bio_TH", "Condition", "Scope", "SourceUrl",
  "Channel", "Fee", "Account Type", "Attachment",
];

export const loadKOLCatalog = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, {
      viewId: VIEWS.KOLS_ALL,
      fieldNames: KOL_CORE_FIELDS,
    });
    const { creators, byId } = parseKOLRecords(records);

    const resolved = await resolveRecordAttachments(records, {
      tableId: TABLES.ALL_KOLS,
      fieldName: "Attachment",
      filter: (a) => a.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(a.name),
    });

    for (const c of creators) {
      const media = resolved.get(c.id);
      if (media?.length) c.image = media[0].url;
    }

    return { creators, byId };
  },
  ["kol-catalog-v4"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load KOLs with profile photos (Attachment is not empty).
 *  Uses the "TikTok with Photos" view for server-side filtering. */
export const loadKOLsWithPhotos = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, {
      viewId: VIEWS.KOLS_WITH_PHOTOS,
      fieldNames: KOL_CORE_FIELDS,
    });
    const { creators, byId } = parseKOLRecords(records);

    const resolved = await resolveRecordAttachments(records, {
      tableId: TABLES.ALL_KOLS,
      fieldName: "Attachment",
      filter: (a) => a.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(a.name),
    });

    for (const c of creators) {
      const media = resolved.get(c.id);
      if (media?.length) c.image = media[0].url;
    }

    return { creators, byId };
  },
  ["kol-photos-v4"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load creator KOLs only (VideoGmv > 0).
 *  Uses the "Creator KOLs" view for server-side filtering. */
export const loadCreatorKOLs = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, {
      viewId: VIEWS.KOLS_CREATOR,
      fieldNames: KOL_CORE_FIELDS,
    });
    return parseKOLRecords(records);
  },
  ["kol-creators-v4"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load live seller KOLs only (LiveGmv > 0).
 *  Uses the "Live Seller KOLs" view for server-side filtering. */
export const loadLiveSellerKOLs = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, {
      viewId: VIEWS.KOLS_LIVE_SELLER,
      fieldNames: KOL_CORE_FIELDS,
    });
    return parseKOLRecords(records);
  },
  ["kol-live-sellers-v4"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load macro KOL creators (VideoGmv > 0 AND Follower >= 100k).
 *  Uses the "Macro KOL Creators" view for server-side filtering. */
export const loadMacroKOLCreators = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, {
      viewId: VIEWS.KOLS_MACRO_CREATOR,
      fieldNames: KOL_CORE_FIELDS,
    });
    return parseKOLRecords(records);
  },
  ["kol-macro-v4"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load a single KOL profile by record_id.
 *  Uses the cached catalog lookup — ~1ms after the first catalog load. */
export async function loadKOLProfile(kolId: string) {
  const { byId } = await loadKOLCatalog();
  return byId[kolId] ?? null;
}

/* ── Dashboard Summary Record Parsing ───────────────────────────────── */

const VALID_DASHBOARD_TYPES = ["overview", "performance", "gmv", "engagement"] as const;
const VALID_TRENDS = ["up", "down", "neutral"] as const;

function parseDashboardType(v: string): DashboardMetric["dashboardType"] {
  return VALID_DASHBOARD_TYPES.includes(v as DashboardMetric["dashboardType"])
    ? (v as DashboardMetric["dashboardType"])
    : "overview";
}

function parseTrend(v: string): DashboardMetric["trend"] {
  return VALID_TRENDS.includes(v as DashboardMetric["trend"])
    ? (v as DashboardMetric["trend"])
    : "neutral";
}

export function recordToDashboardMetric(r: LarkRecord): DashboardMetric {
  const f = r.fields;
  return {
    id: r.record_id,
    period: str(f, "Period"),
    dashboardType: parseDashboardType(str(f, "Dashboard Type")),
    metricKey: str(f, "Metric Key"),
    metricLabel: str(f, "Metric Label"),
    metricValue: num(f, "Metric Value"),
    metricUnit: str(f, "Metric Unit"),
    change: num(f, "Change"),
    trend: parseTrend(str(f, "Trend")),
    ...(num(f, "Benchmark Value") > 0 && { benchmarkValue: num(f, "Benchmark Value") }),
    ...(num(f, "Forecast Value") > 0 && { forecastValue: num(f, "Forecast Value") }),
    ...(f["Is Anomaly"] === true && { isAnomaly: true }),
    ...(str(f, "Insight Text") && { insightText: str(f, "Insight Text") }),
  };
}

/** Load dashboard metrics for a given type and period.
 *  Uses getDashboardKPIs which queries DASHBOARD_SUMMARY directly —
 *  dashboard blocks are broken (reference deleted fields). */
export const loadDashboardMetrics = unstable_cache(
  async (dashboardType: DashboardMetric["dashboardType"], period?: string) => {
    let targetPeriod = period;
    if (!targetPeriod) {
      targetPeriod = await getLatestDashboardPeriod() ?? undefined;
    }

    const kpis = await getDashboardKPIs(dashboardType, targetPeriod);
    return kpis.map((k) => ({
      id: `${k.metricKey}-${k.period}`,
      period: k.period,
      dashboardType: dashboardType as DashboardMetric["dashboardType"],
      metricKey: k.metricKey,
      metricLabel: k.metricLabel,
      metricValue: k.metricValue,
      metricUnit: k.metricUnit,
      change: k.change,
      trend: k.trend,
    }));
  },
  ["dashboard-metrics"],
  { revalidate: 300, tags: ["dashboard"] }
);

/** Load all historical metrics for a given dashboard type (all periods).
 *  Used by charts to render multi-period trends. */
export const loadDashboardMetricsHistory = unstable_cache(
  async (dashboardType: DashboardMetric["dashboardType"]) => {
    const kpis = await getDashboardKPIs(dashboardType);
    return kpis
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((k) => ({
        id: `${k.metricKey}-${k.period}`,
        period: k.period,
        dashboardType: dashboardType as DashboardMetric["dashboardType"],
        metricKey: k.metricKey,
        metricLabel: k.metricLabel,
        metricValue: k.metricValue,
        metricUnit: k.metricUnit,
        change: k.change,
        trend: k.trend,
      }));
  },
  ["dashboard-metrics-history"],
  { revalidate: 300, tags: ["dashboard"] }
);

/** Load all distinct periods available in the Dashboard Summary table.
 *  Used by the period selector dropdown. */
export const loadDashboardPeriods = unstable_cache(
  async () => getDashboardPeriods(),
  ["dashboard-periods"],
  { revalidate: 300, tags: ["dashboard"] }
);

/** Load chart data from DASHBOARD_SUMMARY KPIs.
 *  Dashboard blocks are broken — we compute from the summary table instead. */
export const loadDashboardChartData = unstable_cache(
  async (chartType: "salesCategories" | "collaborationStage" | "monthlyGMV") => {
    // Map chart types to metric key prefixes in DASHBOARD_SUMMARY
    const metricPrefixMap = {
      salesCategories: ["category_"],
      collaborationStage: ["stage_"],
      monthlyGMV: ["gmv_"],
    } as const;

    const prefixes = metricPrefixMap[chartType];
    const latestPeriod = await getLatestDashboardPeriod();
    if (!latestPeriod) return [];

    // Try gmv dashboard for monthlyGMV, overview for others
    const dashboardType = chartType === "monthlyGMV" ? "gmv" : "overview";
    const kpis = await getDashboardKPIs(dashboardType, latestPeriod);

    return kpis
      .filter((k) => prefixes.some((p) => k.metricKey.startsWith(p)))
      .map((k) => ({ label: k.metricLabel, value: k.metricValue }));
  },
  ["dashboard-chart-data"],
  { revalidate: 300, tags: ["dashboard"] }
);

/* ── Studio Record Parsing ──────────────────────────────────────────── */

function recordToStudio(r: LarkRecord): Studio {
  const f = r.fields;
  return {
    id: r.record_id,
    name: str(f, "Studio Name"),
    provider: str(f, "Provider"),
    startingPrice: num(f, "Starting Price"),
    size: str(f, "Size"),
    capacity: num(f, "Capacity"),
    parking: str(f, "Parking"),
    hours: str(f, "Hours"),
    deposit: num(f, "Deposit"),
    contact: str(f, "Contact"),
    reference: str(f, "Reference"),
    recommended: Boolean(f["Recommended"]),
    images: [],
  };
}

/** Load all studio/venue listings.
 *  Display uses `startingPrice` (formula field) — never expose raw `Price`. */
export const loadStudioList = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.STUDIO_LIST, {
      fieldNames: [
        "Studio Name", "Provider", "Starting Price", "Size",
        "Capacity", "Parking", "Hours", "Deposit", "Contact",
        "Reference", "Recommended", "Photos",
      ],
    });
    const studios = records.map(recordToStudio);

    const resolved = await resolveRecordAttachments(records, {
      tableId: TABLES.STUDIO_LIST,
      fieldName: "Photos",
    });

    for (const s of studios) {
      const media = resolved.get(s.id);
      if (media) s.images = media.map((m) => m.url);
    }

    return studios;
  },
  ["studio-list"],
  { revalidate: 300, tags: ["studio"] }
);
