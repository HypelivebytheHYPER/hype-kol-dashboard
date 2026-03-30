// Server-side data fetching — single source of truth
// ALL data comes from POST /records/search via lark-base.ts
// No GET /api/kols or /api/live-sellers — direct Lark Base queries only

import { fetchRecords, TABLES, str, num, arr, url, attachments, type TableId } from "./lark-base";
import type { LarkAttachment, LarkRecord } from "./lark-base";
import { normalizeCategories, CATEGORY_FIELD } from "./categories";

// Re-export
export type { ApiKOL } from "./lark-api";
export type { LiveMC, TechKOL } from "./types/catalog";
export { TABLES, mediaDownloadUrl } from "./lark-base";

import type { ApiKOL } from "./lark-api";
import type { LiveMC, TechKOL } from "./types/catalog";

// ============ Record → ApiKOL mapper ============

function recordToKOL(r: LarkRecord): ApiKOL {
  const f = r.fields;
  return {
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
    contact: {
      lineId: str(f, "LineId"),
      phone: str(f, "Phone"),
      email: str(f, "Contact_Email"),
    },
    isLiveNow: false,
    stats: {
      liveGmv: num(f, "LiveGmv"),
      videoGmv: num(f, "VideoGmv"),
      revenue: num(f, "Revenue"),
      views: num(f, "Views"),
      productCount: num(f, "ProductCount"),
      liveNum: num(f, "LiveNum"),
      videoNum: num(f, "VideoNum"),
    },
    bio: { th: str(f, "Bio_TH"), en: str(f, "Bio_EN") },
    condition: str(f, "Condition"),
    scope: str(f, "Scope"),
    sourceUrl: url(f, "SourceUrl"),
    channel: url(f, "Channel"),
    imageUrl: "",
  };
}

// ============ ALL_KOLS queries (POST /records/search) ============

export async function getAllKOLs(): Promise<{ data: ApiKOL[]; total: number }> {
  const { data, total } = await fetchRecords(TABLES.ALL_KOLS, {
    pageSize: 500,
    revalidate: 300,
    tags: ["kols"],
  });
  return { data: data.map(recordToKOL), total };
}

export async function getKOL(id: string): Promise<{ data: ApiKOL | null }> {
  const { data } = await fetchRecords(TABLES.ALL_KOLS, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: "Record ID", operator: "is", value: [id] }],
    },
    pageSize: 1,
    revalidate: 300,
    tags: ["kols"],
  });
  return { data: data.length > 0 ? recordToKOL(data[0]) : null };
}

export async function getKOLRelated(id: string): Promise<{ data: { parent: ApiKOL | null; children: ApiKOL[] } }> {
  // Search for KOLs that reference this record as parent
  const { data: children } = await fetchRecords(TABLES.ALL_KOLS, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: "Parent KOL", operator: "is", value: [id] }],
    },
    pageSize: 10,
    revalidate: 300,
    tags: ["kols"],
  });
  return { data: { parent: null, children: children.map(recordToKOL) } };
}

export async function searchCreatorsByCategory(
  category: string,
  tableId: TableId = TABLES.ALL_KOLS
): Promise<{ data: ApiKOL[]; total: number }> {
  const { data, total } = await fetchRecords(tableId, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: CATEGORY_FIELD, operator: "contains", value: [category] }],
    },
    pageSize: 500,
    revalidate: 300,
    tags: ["kols", `category-${category.toLowerCase()}`],
  });
  return { data: data.map(recordToKOL), total };
}

export async function searchCreatorsByType(
  kolType: string
): Promise<{ data: ApiKOL[]; total: number }> {
  const { data, total } = await fetchRecords(TABLES.ALL_KOLS, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: "KOLs Type", operator: "is", value: [kolType] }],
    },
    pageSize: 500,
    revalidate: 300,
    tags: ["kols", `type-${kolType.toLowerCase()}`],
  });
  return { data: data.map(recordToKOL), total };
}

// ============ LIVE_MC_LIST ============

export async function getLiveMCs(): Promise<{ data: LiveMC[]; total: number }> {
  const { data: records, total } = await fetchRecords(TABLES.LIVE_MC_LIST, {
    revalidate: 300,
    tags: ["live-mc"],
  });

  const mcs: LiveMC[] = records.map((r) => {
    const f = r.fields;
    const refs = attachments(f, "LIVE Reference");
    return {
      id: r.record_id,
      handle: str(f, "Handle"),
      brands: arr(f, "Brand"),
      categories: normalizeCategories(arr(f, CATEGORY_FIELD)),
      videos: refs.filter((a: LarkAttachment) => a.type?.startsWith("video/")).map((v: LarkAttachment) => ({ token: v.file_token, name: v.name, size: v.size })),
    };
  });

  return { data: mcs, total };
}

// ============ KOL_Tech ============

export async function getTechKOLs(): Promise<{ data: TechKOL[]; total: number }> {
  const { data: records, total } = await fetchRecords(TABLES.KOL_TECH, {
    revalidate: 300,
    tags: ["tech-kols"],
  });

  const kols: TechKOL[] = records.map((r) => {
    const f = r.fields;
    return {
      id: r.record_id,
      name: str(f, "Nickname"),
      handle: str(f, "Handle"),
      followers: num(f, "Follower"),
      specialization: arr(f, "Specialization"),
      categories: arr(f, "Categories"),
      products: arr(f, "Products"),
      location: arr(f, "Location"),
      liveGmv: num(f, "LiveGmv"),
      videoGmv: num(f, "VideoGmv"),
      views: num(f, "Views"),
      liveNum: num(f, "LiveNum"),
      videoNum: num(f, "VideoNum"),
      urls: {
        tiktok: url(f, "TiktokUrl"),
        instagram: url(f, "InstagramUrl"),
        facebook: url(f, "FacebookUrl"),
        youtube: url(f, "YoutubeUrl"),
        x: str(f, "XUrl"),
      },
      contact: { email: str(f, "Contact_Email"), phone: str(f, "Contact_Phone") },
      bio: str(f, "Bio_TH") || str(f, "Bio_EN"),
      profileImage: url(f, "Profile_Image_URL"),
      collaborationStage: str(f, "Collaboration stage"),
      mcnAgency: str(f, "MCN Agency"),
      detailedInfo: str(f, "Detailed information"),
      sourceUrl: url(f, "SourceUrl"),
    };
  });

  return { data: kols, total };
}
