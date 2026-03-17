// Lark Base API Client — connects via Next.js API routes (server-side proxy)
// This keeps the LARK_API_KEY secure on the server

const API_BASE = "/api/lark";

// Rate limit config
const RATE_LIMIT = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

// Custom error class for rate limiting
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public retryCount: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

// Exponential backoff delay
function getBackoffDelay(retryCount: number): number {
  const delay = Math.min(RATE_LIMIT.baseDelayMs * Math.pow(2, retryCount), RATE_LIMIT.maxDelayMs);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch<T>(path: string, init?: RequestInit, retryCount = 0): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Headers for internal API routes (no auth needed - handled server-side)
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });

    // Handle rate limiting (429 Too Many Requests)
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : getBackoffDelay(retryCount);

      if (retryCount < RATE_LIMIT.maxRetries) {
        console.warn(
          `Rate limited. Retrying after ${delayMs}ms (attempt ${retryCount + 1}/${RATE_LIMIT.maxRetries})`
        );
        await sleep(delayMs);
        return apiFetch<T>(path, init, retryCount + 1);
      }

      throw new RateLimitError(
        `Rate limit exceeded after ${retryCount} retries`,
        delayMs,
        retryCount
      );
    }

    // Handle other errors
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${errorText}`);
    }

    return res.json();
  } catch (error) {
    // Network errors - retry with backoff
    if (error instanceof TypeError && retryCount < RATE_LIMIT.maxRetries) {
      const delayMs = getBackoffDelay(retryCount);
      console.warn(
        `Network error. Retrying after ${delayMs}ms (attempt ${retryCount + 1}/${RATE_LIMIT.maxRetries})`
      );
      await sleep(delayMs);
      return apiFetch<T>(path, init, retryCount + 1);
    }

    throw error;
  }
}

// ============ Types matching actual worker responses ============

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
  // Pre-computed image URL (provided by lark-http-hype worker)
  computedImageUrl?: string;
  // Account relationship fields
  accountType?: "Main" | "Secondary" | "Backup" | "Sub-brand";
  parentKOL?: string | null;
  cleanName?: string;
  inferredCategories?: string[];
}

export interface ApiCampaign {
  id: string;
  campaignId: string;
  name: string;
  brand: string;
  type: string;
  status: string;
  budget: number;
  gmvTarget?: number;
  actualGmv: number;
  roi: number;
  internalCost: number;
  profitMargin: number;
  startDate: string;
  endDate: string;
  manager: string;
  assignedKOLs: string[];
}

export interface ApiLiveSeller extends ApiKOL {
  status: string;
  verified: boolean;
  profileImage: string;
  urls: { tiktok: string; instagram: string; channel: string };
  tierPerformance: string;
  imageUrl: string;
}

export interface ApiRateCard {
  id: string;
  rateId: string;
  kolId: string;
  kolName: string;
  kolHandle: string;
  serviceType: string;
  rate: number;
  clientRate: number;
  markupPercent: number;
  profitAmount: number;
  duration: string;
  status: string;
  platform: string;
  season: string;
  seasonalMultiplier: number;
  effectiveDate: string;
  effectiveRate: number;
}

export interface ApiTierRate {
  id: string;
  tierName: string;
  minFollowers: number;
  maxFollowers: number;
  baseRate: number;
  baseRatePerFollower: number;
  status: string;
}

export interface ApiCompetitorRate {
  id: string;
  agency: string;
  kolTier: string;
  serviceType: string;
  rate: number;
  platform: string;
  notes: string;
}

export interface ApiMarketBenchmark {
  id: string;
  tier: string;
  platform: string;
  contentType: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  source: string;
  sourceUrl: string;
  year: number;
  notes: string;
}

export interface ApiNicheKOL extends ApiKOL {
  niche: string;
  collaborationStage: string;
  fee: number;
  imageUrl: string;
}

export interface ApiTechKOL {
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
  specialization: string[];
  products: string[];
  location: string;
  kolType: string;
  niche: string;
  collaborationStage: string;
  mcnAgency: string;
  internalContact: string;
  contact: { email: string; phone: string };
  urls: { tiktok: string; facebook: string; instagram: string; youtube: string; x: string };
  isLiveNow: boolean;
  stats: ApiKOL["stats"];
  bio: { th: string; en: string };
  profileImage: string;
  sourceUrl: string;
  detailedInfo: string;
  imageUrl: string;
}

export interface ApiSearchResult {
  data: { kols: ApiKOL[]; campaigns: ApiCampaign[]; rates: ApiRateCard[] };
  meta: {
    query: string;
    filters: Record<string, unknown>;
    pagination: { page: number; perPage: number };
    totals: { kols: number; campaigns: number; rates: number; all: number };
    facets: { tiers: string[]; platforms: string[]; locations: string[]; categories: string[] };
  };
}

export interface ApiOOHMedia {
  id: string;
  category: string;
  mediaName: string;
  vendor: string;
  subcategory: string[];
  locationCoverage: string[];
  unitType: string;
  quantity: string;
  monthlyRate: number;
  totalRate: number;
  productionCost: number;
  loopDuration: string;
  spotsPerLoop: string;
  minimumPeriod: string;
  specifications: string;
  specialNotes: string;
  link?: string;
}

// ============ Image Helpers ============

/** Resolve a KOL's image URL. Falls back to unavatar.io via proxy for real social profile photos. */
export function getKOLImageUrl(kol: {
  imageUrl?: string;
  handle?: string;
  platform?: string;
}): string {
  if (kol.imageUrl && kol.imageUrl.startsWith("/api/image/")) {
    return `${API_BASE}${kol.imageUrl}/redirect`;
  }
  if (kol.imageUrl) return kol.imageUrl;

  // Fetch real profile photo from social platform via unavatar.io (proxied)
  const handle = kol.handle?.trim().replace(/^@/, "");
  if (!handle) return "";

  const p = (kol.platform || "").toLowerCase();
  let unavatarUrl: string;

  if (p.includes("instagram")) {
    unavatarUrl = `https://unavatar.io/instagram/${handle}`;
  } else if (p.includes("youtube")) {
    unavatarUrl = `https://unavatar.io/youtube/${handle}`;
  } else if (p.includes("facebook")) {
    unavatarUrl = `https://unavatar.io/facebook/${handle}`;
  } else {
    // Default: TikTok
    unavatarUrl = `https://unavatar.io/tiktok/${handle}`;
  }

  // Return proxied URL to avoid CORS issues and handle Accept headers properly
  return `/api/proxy/image?url=${encodeURIComponent(unavatarUrl)}`;
}

// ============ API Client ============

export const larkApi = {
  // KOLs
  getKOLs: (params?: { pageSize?: number; pageToken?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.pageToken) searchParams.set("pageToken", params.pageToken);
    const q = searchParams.toString() ? `?${searchParams}` : "";
    return apiFetch<{ data: ApiKOL[]; total: number }>(`/api/kols${q}`);
  },
  getKOL: (id: string) => apiFetch<{ data: ApiKOL }>(`/api/kols/${id}`),
  getKOLRelated: (id: string) =>
    apiFetch<{ data: { parent?: ApiKOL; children: ApiKOL[] } }>(`/api/kols/${id}/related`),
  getLiveKOLs: () => apiFetch<{ data: ApiKOL[]; total: number }>("/api/kols/live"),

  // Niche KOLs
  getDoctorKOLs: () => apiFetch<{ data: ApiNicheKOL[]; total: number }>("/api/kols/doctor"),
  getBeautyKOLs: () => apiFetch<{ data: ApiNicheKOL[]; total: number }>("/api/kols/beauty"),
  getTechKOLs: () => apiFetch<{ data: ApiTechKOL[]; total: number }>("/api/kols/tech"),
  getNicheKOLs: (niche?: string) => {
    const q = niche ? `?niche=${niche}` : "";
    return apiFetch<{
      data: (ApiNicheKOL | ApiTechKOL)[];
      total: number;
      breakdown: Record<string, number>;
    }>(`/api/kols/niche${q}`);
  },

  // OOH Media
  getOOHMedia: (params?: {
    category?: string;
    vendor?: string;
    location?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.vendor) searchParams.set("vendor", params.vendor);
    if (params?.location) searchParams.set("location", params.location);
    if (params?.search) searchParams.set("search", params.search);
    const q = searchParams.toString() ? `?${searchParams}` : "";
    return apiFetch<{ data: ApiOOHMedia[]; total: number }>(`/api/ooh-media${q}`);
  },

  // Campaigns
  getCampaigns: () => apiFetch<{ data: ApiCampaign[]; total: number }>("/api/campaigns"),
  getCampaign: (id: string) => apiFetch<{ data: ApiCampaign }>(`/api/campaigns/${id}`),
  createCampaign: (body: Record<string, unknown>) =>
    apiFetch<{ data: ApiCampaign }>("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  updateCampaign: (id: string, body: Record<string, unknown>) =>
    apiFetch<{ data: ApiCampaign }>(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  // Live Sellers
  getLiveSellers: () => apiFetch<{ data: ApiLiveSeller[]; total: number }>("/api/live-sellers"),
  getLiveNow: () =>
    apiFetch<{ data: ApiLiveSeller[]; total: number }>("/api/live-sellers/live-now"),

  // Pricing
  getRateCards: (kolId?: string) => {
    const q = kolId ? `?kolId=${kolId}` : "";
    return apiFetch<{ data: ApiRateCard[]; total: number }>(`/api/rate-cards${q}`);
  },
  getTierRates: () => apiFetch<{ data: ApiTierRate[]; total: number }>("/api/tier-rates"),
  getCompetitorRates: () =>
    apiFetch<{ data: ApiCompetitorRate[]; total: number }>("/api/competitor-rates"),
  getMarketBenchmarks: (tier?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (tier) params.set("tier", tier);
    if (platform) params.set("platform", platform);
    const q = params.toString() ? `?${params}` : "";
    return apiFetch<{ data: ApiMarketBenchmark[]; total: number }>(`/api/market-benchmarks${q}`);
  },

  // Search (uses POST for complex queries to support array filters properly)
  search: (params: {
    q?: string;
    type?: string;
    tier?: string | string[];
    platform?: string | string[];
    category?: string | string[];
    location?: string | string[];
    minFollowers?: number;
    maxFollowers?: number;
    minGMV?: number;
    maxGMV?: number;
    live?: boolean;
    page?: number;
    perPage?: number;
  }) => {
    // Use POST for complex queries with arrays, GET for simple queries
    const hasArrays = Object.values(params).some((v) => Array.isArray(v));
    if (hasArrays) {
      return apiFetch<ApiSearchResult>("/api/search", {
        method: "POST",
        body: JSON.stringify(params),
      });
    }
    // Simple query - use GET
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    });
    return apiFetch<ApiSearchResult>(`/api/search?${searchParams}`);
  },

  semanticSearch: (q: string, limit = 20) =>
    apiFetch<{
      data: ApiKOL[];
      meta: { query: string; semanticConcepts: string[]; total: number };
    }>(`/api/search/semantic?q=${encodeURIComponent(q)}&limit=${limit}`),

  quickSearch: (q: string, limit = 10) =>
    apiFetch<{
      suggestions: Array<{
        id: string;
        type: string;
        title: string;
        subtitle: string;
        avatar?: string;
      }>;
      categories: Array<{ type: string; title: string; count: number }>;
    }>(`/api/search/quick?q=${encodeURIComponent(q)}&limit=${limit}`),
};
