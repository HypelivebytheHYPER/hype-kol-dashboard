// Cached data fetching for Server Components
// Uses Next.js 16 "use cache" directive for edge caching

import { cacheLife, cacheTag } from "next/cache";

const LARK_API_URL = process.env.NEXT_PUBLIC_LARK_API_URL || "https://lark-http-hype.hypelive.workers.dev";
const LARK_API_KEY = process.env.LARK_API_KEY;

// Types (matching your existing types)
export interface KOL {
  id: string;
  name: string;
  handle: string;
  tier?: string;
  followers?: number;
  avgGMV?: number;
  avgLiveGMV?: number;
  engagementRate: number;
  isLiveNow?: boolean;
  categories?: string[];
  computedImageUrl?: string;
  imageUrl?: string;
  platform?: string;
}

interface KOLResponse {
  data: KOL[];
  total: number;
}

/**
 * Fetch popular KOLs with caching
 * Cached for 5 minutes at edge - first visitor triggers fetch, rest get cached
 */
export async function getPopularKOLs(): Promise<KOLResponse> {
  "use cache";
  cacheLife("minutes"); // Cache for minutes (default 5min)
  cacheTag("kols-popular");

  const headers: Record<string, string> = {};
  if (LARK_API_KEY) {
    headers["Authorization"] = `Bearer ${LARK_API_KEY}`;
  }

  const res = await fetch(`${LARK_API_URL}/api/kols?limit=20`, {
    headers,
    // Use force-cache for Server Components - Next.js will cache the fetch
    cache: "force-cache",
    next: {
      revalidate: 300, // 5 minutes
      tags: ["kols"],
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch KOLs:", res.status);
    return { data: [], total: 0 };
  }

  return res.json();
}

/**
 * Fetch live sellers with shorter cache (30s)
 */
export async function getLiveSellers(): Promise<KOLResponse> {
  "use cache";
  cacheLife("seconds"); // Shorter cache for live data
  cacheTag("live-sellers");

  const headers: Record<string, string> = {};
  if (LARK_API_KEY) {
    headers["Authorization"] = `Bearer ${LARK_API_KEY}`;
  }

  const res = await fetch(`${LARK_API_URL}/api/live-sellers?limit=20`, {
    headers,
    cache: "force-cache",
    next: {
      revalidate: 30, // 30 seconds
      tags: ["live-sellers"],
    },
  });

  if (!res.ok) {
    return { data: [], total: 0 };
  }

  return res.json();
}

/**
 * Fetch category-specific KOLs
 */
export async function getCategoryKOLs(category: string): Promise<KOLResponse> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`kols-category-${category}`);

  const headers: Record<string, string> = {};
  if (LARK_API_KEY) {
    headers["Authorization"] = `Bearer ${LARK_API_KEY}`;
  }

  const res = await fetch(
    `${LARK_API_URL}/api/kols?category=${encodeURIComponent(category)}&limit=10`,
    {
      headers,
      cache: "force-cache",
      next: {
        revalidate: 300,
        tags: ["kols", `category-${category}`],
      },
    }
  );

  if (!res.ok) {
    return { data: [], total: 0 };
  }

  return res.json();
}

/**
 * Fetch campaigns
 */
export async function getCampaigns(): Promise<{ data: unknown[]; total: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("campaigns");

  const headers: Record<string, string> = {};
  if (LARK_API_KEY) {
    headers["Authorization"] = `Bearer ${LARK_API_KEY}`;
  }

  const res = await fetch(`${LARK_API_URL}/api/campaigns`, {
    headers,
    cache: "force-cache",
    next: {
      revalidate: 60,
      tags: ["campaigns"],
    },
  });

  if (!res.ok) {
    return { data: [], total: 0 };
  }

  return res.json();
}
