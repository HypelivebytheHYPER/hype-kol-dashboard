// Transform raw Lark records into typed domain objects (Creator, LiveMC) and
// collapse multi-row creators down to one entry per KOL.

import { unstable_cache } from "next/cache";
import { str, num, arr, url, attachments, buildMediaUrl, fetchAllRecords, TABLES, type LarkRecord, type LarkAttachment } from "./lark-base";
import {
  normalizeCategories,
  CATEGORY_FIELD,
  getMCContentCategories,
} from "./taxonomy";
import type { Creator, LiveMC } from "./types/catalog";

/* ── KOL Record Parsing ─────────────────────────────────────────────── */

/** Convert a single raw Lark row into a typed Creator.
 *  Private — consumers should use `loadKOLCatalog` or `loadKOLProfile`. */
function recordToCreator(r: LarkRecord): Creator {
  const f = r.fields;
  const accountType = str(f, "Account Type");
  const fee = num(f, "Fee");
  const creator: Creator = {
    id: r.record_id,
    kolId: str(f, "Record ID") || r.record_id,
    name: str(f, "Nickname") || str(f, "Handle"),
    handle: str(f, "Handle"),
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

  const att = attachments(f, "Attachment");
  const img = att.find((a: LarkAttachment) => a.type?.startsWith("image/"));
  if (img) creator.image = buildMediaUrl(img.file_token, TABLES.ALL_KOLS);

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
export const loadKOLCatalog = unstable_cache(
  async () => {
    const records = await fetchAllRecords(TABLES.ALL_KOLS, { tags: ["kols"] });
    return parseKOLRecords(records);
  },
  ["kol-catalog"],
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
  return {
    id: r.record_id,
    handle: str(f, "Handle"),
    brands: brandList,
    categories: normalizeCategories(arr(f, CATEGORY_FIELD)),
    contentCategories: getMCContentCategories(brandList),
    videos: refs
      .filter((a: LarkAttachment) => a.type?.startsWith("video/"))
      .map((v: LarkAttachment) => ({ token: v.file_token, name: v.name })),
  };
}
