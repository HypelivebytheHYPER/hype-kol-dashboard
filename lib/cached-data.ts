// Record mappers — transform Lark Base records to typed objects
// Pages call fetchRecords() from lark-base.ts directly

import { str, num, arr, url, attachments, type LarkRecord, type LarkAttachment } from "./lark-base";
import { normalizeCategories, CATEGORY_FIELD } from "./categories";
import type { Creator } from "./types/catalog";
import type { LiveMC, TechKOL } from "./types/catalog";

export type { Creator, LiveMC, TechKOL } from "./types/catalog";
export { TABLES, fetchRecords } from "./lark-base";

export function recordToCreator(r: LarkRecord): Creator {
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
    accountType: str(f, "Account Type") as Creator["accountType"],
    parentKOL: str(f, "Parent KOL") || null,
  };
}

export function recordToLiveMC(r: LarkRecord): LiveMC {
  const f = r.fields;
  const refs = attachments(f, "LIVE Reference");
  return {
    id: r.record_id,
    handle: str(f, "Handle"),
    brands: arr(f, "Brand"),
    categories: normalizeCategories(arr(f, CATEGORY_FIELD)),
    videos: refs.filter((a: LarkAttachment) => a.type?.startsWith("video/")).map((v: LarkAttachment) => ({ token: v.file_token, name: v.name, size: v.size })),
  };
}

export function recordToTechKOL(r: LarkRecord): TechKOL {
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
      tiktok: url(f, "TiktokUrl"), instagram: url(f, "InstagramUrl"),
      facebook: url(f, "FacebookUrl"), youtube: url(f, "YoutubeUrl"), x: str(f, "XUrl"),
    },
    contact: { email: str(f, "Contact_Email"), phone: str(f, "Contact_Phone") },
    bio: str(f, "Bio_TH") || str(f, "Bio_EN"),
    profileImage: url(f, "Profile_Image_URL"),
    collaborationStage: str(f, "Collaboration stage"),
    mcnAgency: str(f, "MCN Agency"),
    detailedInfo: str(f, "Detailed information"),
    sourceUrl: url(f, "SourceUrl"),
  };
}
