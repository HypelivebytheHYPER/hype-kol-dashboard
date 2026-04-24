// Transform raw Lark records into typed domain objects (Creator, LiveMC) and
// collapse multi-row creators down to one entry per KOL.

import { unstable_cache } from "next/cache";
import { str, num, arr, url, attachments, buildMediaUrl, fetchRecords, fetchAllRecords, TABLES, type LarkRecord, type LarkAttachment } from "./lark-base";
import {
  normalizeCategories,
  CATEGORY_FIELD,
  getMCContentCategories,
} from "./taxonomy";
import { batchFetchAvatars } from "./profile-photo-server";
import type { Creator, LiveMC, DashboardMetric, Studio } from "./types/catalog";



/* ── KOL Record Parsing ─────────────────────────────────────────────── */

/** Convert a single raw Lark row into a typed Creator.
 *  Private — consumers should use `loadKOLCatalog` or `loadKOLProfile`. */
/** Extract TikTok handle from a profile URL like https://www.tiktok.com/@username */
function extractTikTokHandleFromUrl(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const match = url.pathname.match(/^\/@([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

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
    platform: str(f, "Platform"),
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
    },
    bio: { th: str(f, "Bio_TH"), en: str(f, "Bio_EN") },
    condition: str(f, "Condition"),
    scope: str(f, "Scope"),
    sourceUrl: url(f, "SourceUrl"),
    channel: url(f, "Channel"),
    fees: fee > 0 ? { min: fee, max: fee, count: 1 } : null,
  };
  if (accountType) creator.accountType = accountType;

  // 1. Prefer Lark Base attachment (uploaded image)
  //    tmp_url expires quickly — always use the stable worker proxy.
  const att = attachments(f, "Attachment");
  const isImage = (a: LarkAttachment) =>
    a.type?.startsWith("image/") ?? /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(a.name);
  const images = att.filter(isImage);
  const img = images.length > 0 ? images[images.length - 1] : undefined;
  if (img) {
    creator.image = buildMediaUrl(img.file_token, TABLES.ALL_KOLS);
  } else {
    // 2. Fall back to stored profile photo URL (scraped from TikTok/IG profile page)
    const profilePhotoUrl =
      str(f, "Profile Photo URL") ||
      str(f, "Avatar URL") ||
      str(f, "Profile Image") ||
      str(f, "Photo") ||
      str(f, "Image");
    if (profilePhotoUrl) creator.image = profilePhotoUrl;
  }

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

/** Check if a stored image URL is usable (not an expired TikTok CDN URL). */
function isUsableImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  // TikTok CDN URLs with x-signature expire quickly
  if (url.includes("tiktokcdn") && url.includes("x-signature")) return false;
  return true;
}

/** Build a profile page URL from creator data for avatar fetching. */
function buildProfileUrl(creator: Creator): string | null {
  if (creator.channel) return creator.channel;
  if (creator.handle && creator.platform?.toLowerCase().includes("tiktok")) {
    return `https://www.tiktok.com/@${creator.handle}`;
  }
  if (creator.handle && creator.platform?.toLowerCase().includes("instagram")) {
    return `https://www.instagram.com/${creator.handle}/`;
  }
  return null;
}

/** Load the full KOL catalog (list view).
 *  Cached via Next.js unstable_cache — survives across requests, cold starts,
 *  and Vercel edge regions. Revalidates every 5 minutes.
 *  Also fetches fresh avatar URLs for creators with expired/missing images. */
export const loadKOLCatalog = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, { tags: ["kols"] });
    const { creators, byId } = parseKOLRecords(records);

    // Identify creators that need fresh avatar URLs
    const needAvatars = creators
      .filter((c) => !isUsableImageUrl(c.image))
      .map((c) => ({ key: c.id, profileUrl: buildProfileUrl(c) }))
      .filter((e): e is { key: string; profileUrl: string } => Boolean(e.profileUrl));

    if (needAvatars.length > 0) {
      const avatars = await batchFetchAvatars(needAvatars, 8);
      for (const [id, freshUrl] of avatars) {
        if (freshUrl) {
          const creator = byId[id];
          if (creator) creator.image = freshUrl;
        }
      }
    }

    return { creators, byId };
  },
  ["kol-catalog-v3"],
  { revalidate: 300, tags: ["kols"] }
);

/** Load a single KOL profile by record_id.
 *  Uses the cached catalog lookup — ~1ms after the first catalog load. */
export async function loadKOLProfile(kolId: string) {
  const { byId } = await loadKOLCatalog();
  return byId[kolId] ?? null;
}

/* ── Live MC Record Parsing ─────────────────────────────────────────── */

export function recordToLiveMC(r: LarkRecord): LiveMC {
  const f = r.fields;
  const refs = attachments(f, "LIVE Reference");
  const brandList = arr(f, "Brand");

  // Lark's +record-list API doesn't return type/url/tmp_url for attachments.
  // Infer media type from filename extension and always use worker proxy.
  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|avif|bmp|heic)$/i.test(name);
  const isVideo = (name: string) => /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(name);
  const mediaUrl = (a: LarkAttachment) => buildMediaUrl(a.file_token, TABLES.LIVE_MC_LIST);

  const images = refs
    .filter((a: LarkAttachment) => isImage(a.name) || a.type?.startsWith("image/"))
    .map((img: LarkAttachment) => ({
      token: img.file_token,
      url: mediaUrl(img),
      name: img.name,
    }));
  const profilePhoto = str(f, "Profile Photo URL") || str(f, "Avatar URL") || undefined;
  const mc: LiveMC = {
    id: r.record_id,
    handle: str(f, "Handle"),
    brands: brandList,
    categories: normalizeCategories(arr(f, CATEGORY_FIELD)),
    contentCategories: getMCContentCategories(brandList),
    ...(profilePhoto ? { profilePhoto } : {}),
    images,
    videos: refs
      .filter((a: LarkAttachment) => isVideo(a.name) || a.type?.startsWith("video/"))
      .map((v: LarkAttachment) => ({
        token: v.file_token,
        url: mediaUrl(v),
        name: v.name,
      })),
  };
  return mc;
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
  };
}

/** Load dashboard metrics for a given type and period.
 *  If no period is specified, defaults to the latest period available.
 *  Cached via Next.js unstable_cache — fast lookup from pre-computed summary table. */
export const loadDashboardMetrics = unstable_cache(
  async (dashboardType: DashboardMetric["dashboardType"], period?: string) => {
    let targetPeriod = period;

    // Default to the latest period when none specified
    if (!targetPeriod) {
      const latest = await fetchRecords(TABLES.DASHBOARD_SUMMARY, {
        filter: {
          conjunction: "and",
          conditions: [{ fieldName: "Dashboard Type", operator: "is", value: [dashboardType] }],
        },
        sort: [{ fieldName: "Period", desc: true }],
        pageSize: 1,
        fieldNames: ["Period"],
      });
      targetPeriod = latest.data[0] ? str(latest.data[0].fields, "Period") : undefined;
    }

    const filter: {
      conjunction: "and";
      conditions: Array<{
        fieldName: string;
        operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty";
        value: string[];
      }>;
    } = {
      conjunction: "and",
      conditions: [
        { fieldName: "Dashboard Type", operator: "is", value: [dashboardType] },
      ],
    };
    if (targetPeriod) {
      filter.conditions.push({ fieldName: "Period", operator: "is", value: [targetPeriod] });
    }
    const records = await fetchAllRecords(TABLES.DASHBOARD_SUMMARY, {
      filter,
      tags: ["dashboard"],
    });
    return records.map(recordToDashboardMetric);
  },
  ["dashboard-metrics"],
  { revalidate: 300, tags: ["dashboard"] }
);

/** Load all historical metrics for a given dashboard type (all periods).
 *  Used by charts to render multi-period trends. */
export const loadDashboardMetricsHistory = unstable_cache(
  async (dashboardType: DashboardMetric["dashboardType"]) => {
    const records = await fetchAllRecords(TABLES.DASHBOARD_SUMMARY, {
      filter: {
        conjunction: "and",
        conditions: [{ fieldName: "Dashboard Type", operator: "is", value: [dashboardType] }],
      },
      sort: [{ fieldName: "Period", desc: false }],
      tags: ["dashboard"],
    });
    return records.map(recordToDashboardMetric);
  },
  ["dashboard-metrics-history"],
  { revalidate: 300, tags: ["dashboard"] }
);

/** Load all distinct periods available in the Dashboard Summary table.
 *  Used by the period selector dropdown. */
export const loadDashboardPeriods = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.DASHBOARD_SUMMARY, {
      fieldNames: ["Period"],
      tags: ["dashboard"],
    });
    const periods = Array.from(new Set(records.map((r) => str(r.fields, "Period"))))
      .filter(Boolean)
      .sort();
    return periods;
  },
  ["dashboard-periods"],
  { revalidate: 300, tags: ["dashboard"] }
);

/* ── Studio Record Parsing ──────────────────────────────────────────── */

function recordToStudio(r: LarkRecord): Studio {
  const f = r.fields;
  const photos = attachments(f, "Photos");
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
    images: photos.map((p) => buildMediaUrl(p.file_token, TABLES.STUDIO_LIST)),
  };
}

/** Load all studio/venue listings.
 *  Display uses `startingPrice` (formula field) — never expose raw `Price`. */
export const loadStudioList = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.STUDIO_LIST, {
      tags: ["studio"],
    });
    return records.map(recordToStudio);
  },
  ["studio-list"],
  { revalidate: 300, tags: ["studio"] }
);
