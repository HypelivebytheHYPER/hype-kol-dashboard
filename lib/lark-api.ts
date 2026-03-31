// KOL type — matches ALL_KOLS Lark Base table schema via POST /records/search

export interface ApiKOL {
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

// Profile photo from unavatar.io/{platform}/{handle}
export function getKOLImageUrl(kol: {
  handle?: string;
  platform?: string;
}): string {
  const handle = kol.handle?.trim().replace(/^@/, "");
  if (!handle) return "";

  const p = (kol.platform || "").toLowerCase();
  if (p.includes("instagram")) return `https://unavatar.io/instagram/${handle}`;
  if (p.includes("youtube")) return `https://unavatar.io/youtube/${handle}`;
  if (p.includes("facebook")) return `https://unavatar.io/facebook/${handle}`;
  return `https://unavatar.io/tiktok/${handle}`;
}
