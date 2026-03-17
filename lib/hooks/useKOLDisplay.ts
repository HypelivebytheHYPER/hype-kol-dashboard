/**
 * useKOLDisplay Hook
 * Transforms full KOL data to display format for client proposals
 * Handles formatting of numbers, GMV ranges, and content type detection
 */

import { useMemo, useCallback } from "react";
import type {
  KOL,
  KOLCardData,
  KOLDisplayData,
  DisplayContentType,
  Category,
} from "@/lib/types/kol";
import { getKOLImageUrl } from "@/lib/lark-api";

// Re-export types for convenience
export type { KOLDisplayData, DisplayContentType as ContentType };

/**
 * Format follower count to readable string (1.2K, 1.5M)
 */
export function formatFollowers(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format GMV value to readable range string
 * Converts raw numbers to ranges like "< $2.5K", "$2.5K - $5K", "> $50K"
 */
export function formatGMV(gmv: number): string {
  // Define GMV tiers in THB
  const tiers = [
    { threshold: 2500, label: "< ฿2.5K" },
    { threshold: 5000, label: "฿2.5K - 5K" },
    { threshold: 10000, label: "฿5K - 10K" },
    { threshold: 25000, label: "฿10K - 25K" },
    { threshold: 50000, label: "฿25K - 50K" },
    { threshold: 100000, label: "฿50K - 100K" },
    { threshold: Infinity, label: "> ฿100K" },
  ];

  for (const tier of tiers) {
    if (gmv < tier.threshold) {
      return tier.label;
    }
  }

  return "> ฿100K";
}

/**
 * Determine content type from live and video counts
 */
export function getContentType(liveCount: number, videoCount: number): DisplayContentType {
  const hasLive = liveCount > 0;
  const hasVideo = videoCount > 0;

  if (hasLive && hasVideo) {
    return "Both";
  }
  if (hasLive) {
    return "Live streaming";
  }
  return "Short video";
}

/**
 * Transform KOLProfile to KOLDisplayData
 */
export function transformToDisplayData(kol: KOL): KOLDisplayData {
  return {
    // Identity
    id: kol.id,
    nickname: kol.nickname || kol.name || "",
    handle: kol.handle,
    platform: kol.platform,
    category: (kol.category as Category | undefined) || undefined,
    tier: kol.tier || "C",
    verified: kol.verified || false,
    profileImage: getKOLImageUrl({
      imageUrl: kol.profileImage,
      handle: kol.handle,
      platform: kol.platform,
    }),

    // Primary metrics
    followers: kol.followers,
    engagementRate: kol.engagementRate,
    avgMonthlyGMV: formatGMV(kol.avgMonthlyGMV || 0),
    qualityScore: kol.qualityScore,

    // Content classification
    contentType: getContentType(kol.liveCount || 0, kol.videoCount || 0),

    // Secondary metrics (for detail view)
    liveCount: kol.liveCount,
    videoCount: kol.videoCount,
    productCount: kol.productCount,

    // Bio
    bio: kol.bio,

    // Social links
    tiktokUrl: kol.tiktokUrl,
    instagramUrl: kol.instagramUrl,

    // Contact (hidden until added to campaign)
    phone: kol.phone,
    lineId: kol.lineId,
    email: kol.email,
  };
}

/**
 * Transform KOLCardData to KOLDisplayData
 * For use with already-minimal card data
 */
export function transformCardToDisplayData(kol: KOLCardData): KOLDisplayData {
  return {
    // Identity
    id: kol.id,
    nickname: kol.nickname,
    handle: kol.handle,
    platform: kol.platform,
    category: kol.category,
    tier: kol.tier,
    verified: kol.verified,
    profileImage: getKOLImageUrl({
      imageUrl: kol.profileImage,
      handle: kol.handle,
      platform: kol.platform,
    }),

    // Primary metrics
    followers: kol.followers,
    engagementRate: kol.engagementRate,
    avgMonthlyGMV: formatGMV(kol.avgMonthlyGMV),
    qualityScore: kol.qualityScore,

    // Content classification (default since card data doesn't have counts)
    contentType: "Both",
  };
}

/**
 * Hook for transforming KOL data to display format
 * Memoizes the transformation for performance
 */
export function useKOLDisplay(kol: KOL | KOLCardData | null): KOLDisplayData | null {
  return useMemo(() => {
    if (!kol) return null;

    // Check if it's full KOL (has avgViews field)
    if ("avgViews" in kol && kol.avgViews !== undefined) {
      return transformToDisplayData(kol as KOL);
    }

    // It's KOLCardData
    return transformCardToDisplayData(kol as KOLCardData);
  }, [kol]);
}

/**
 * Hook for transforming an array of KOLs
 */
export function useKOLDisplayList(kols: (KOL | KOLCardData)[]): KOLDisplayData[] {
  return useMemo(() => {
    return kols.map((kol) => {
      if ("avgViews" in kol && kol.avgViews !== undefined) {
        return transformToDisplayData(kol as KOL);
      }
      return transformCardToDisplayData(kol as KOLCardData);
    });
  }, [kols]);
}

/**
 * Convert ApiKOL (from lark-api) to KOLCardData for discovery components
 */
export function apiKOLToCardData(kol: {
  id: string;
  name?: string;
  handle?: string;
  platform?: string;
  tier?: string;
  followers?: number;
  engagementRate?: number;
  avgGMV?: number;
  avgLiveGMV?: number;
  qualityScore?: number;
  categories?: string[];
  imageUrl?: string;
  stats?: { liveNum?: number; videoNum?: number; productCount?: number };
}): KOLCardData {
  return {
    id: kol.id,
    nickname: kol.name || kol.handle || "Unknown",
    handle: kol.handle || "",
    platform: kol.platform || "Unknown",
    category: (kol.categories?.[0] as Category | undefined) || undefined,
    tier: (kol.tier as KOL["tier"]) || "C",
    verified: false,
    profileImage: getKOLImageUrl({
      imageUrl: kol.imageUrl,
      handle: kol.handle,
      platform: kol.platform,
    }),
    followers: kol.followers || 0,
    engagementRate: kol.engagementRate || 0,
    avgMonthlyGMV: kol.avgGMV || kol.avgLiveGMV || 0,
    liveCount: kol.stats?.liveNum || 0,
    videoCount: kol.stats?.videoNum || 0,
    productCount: kol.stats?.productCount || 0,
    qualityScore: kol.qualityScore || 0,
  };
}

/**
 * Hook providing formatter utilities
 */
export function useKOLFormatters() {
  return useCallback(
    () => ({
      formatFollowers,
      formatGMV,
      getContentType,
      transformToDisplayData,
      transformCardToDisplayData,
      apiKOLToCardData,
    }),
    []
  );
}
