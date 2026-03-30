// Types matching Lark Base table schemas

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
