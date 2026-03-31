// Types matching Lark Base table schemas — single source of truth

// ALL_KOLS (tbl5864QVOiEokTQ)
export interface Creator {
  id: string;
  kolId: string;
  name: string;
  handle: string;
  platform: string;
  tier: string;
  followers: number;
  engagementRate: number;
  avgGMV: number;
  avgLiveGMV: number;
  qualityScore: number;
  categories: string[];
  location: string;
  kolType: string;
  contact: { lineId: string; phone: string; email: string };
  stats: {
    liveGmv: number;
    videoGmv: number;
    revenue: number;
    views: number;
    productCount: number;
    liveNum: number;
    videoNum: number;
  };
  bio: { th: string; en: string };
  condition: string;
  scope: string;
  sourceUrl: string;
  channel: string;
  accountType?: string;
  parentKOL?: string | null;
}

// LIVE_MC_LIST (tblozhTWBHelXqRR)
export interface LiveMC {
  id: string;
  handle: string;
  brands: string[];
  categories: string[];
  videos: { token: string; name: string; size: number }[];
}

// KOL_Tech (tbl8rJWSTEemTeJh)
export interface TechKOL {
  id: string;
  name: string;
  handle: string;
  followers: number;
  specialization: string[];
  categories: string[];
  products: string[];
  location: string[];
  liveGmv: number;
  videoGmv: number;
  views: number;
  liveNum: number;
  videoNum: number;
  urls: { tiktok: string; instagram: string; facebook: string; youtube: string; x: string };
  contact: { email: string; phone: string };
  bio: string;
  profileImage: string;
  collaborationStage: string;
  mcnAgency: string;
  detailedInfo: string;
  sourceUrl: string;
}
