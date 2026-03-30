// KOL types and image URL resolver
// Types match the Lark Base ALL_KOLS table schema

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
  isLiveNow: boolean;
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
  imageUrl: string;
  computedImageUrl?: string;
  accountType?: "Main" | "Secondary" | "Backup" | "Sub-brand";
  parentKOL?: string | null;
  cleanName?: string;
  inferredCategories?: string[];
  urls?: Record<string, string>;
}

// Resolve KOL image URL — unavatar.io fallback for profile photos
export function getKOLImageUrl(kol: {
  imageUrl?: string;
  handle?: string;
  platform?: string;
}): string {
  if (kol.imageUrl?.startsWith("http://") || kol.imageUrl?.startsWith("https://")) {
    return kol.imageUrl;
  }

  if (kol.imageUrl) return kol.imageUrl;

  const handle = kol.handle?.trim().replace(/^@/, "");
  if (!handle) return "";

  const p = (kol.platform || "").toLowerCase();
  if (p.includes("instagram")) return `https://unavatar.io/instagram/${handle}`;
  if (p.includes("youtube")) return `https://unavatar.io/youtube/${handle}`;
  if (p.includes("facebook")) return `https://unavatar.io/facebook/${handle}`;
  return `https://unavatar.io/tiktok/${handle}`;
}
