"use client";

import type { ApiKOL } from "./lark-api";

export interface SearchFilters {
  query?: string;
  tier?: string;
  platform?: string;
  category?: string;
  location?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  kolType?: string;
  hasContact?: boolean;
}

interface ParsedQuery {
  filters: SearchFilters;
  rawQuery: string;
}

// Natural language patterns
const PATTERNS = {
  // Tier: nano, micro, mid, macro, mega
  tier: /\b(nano|micro|mid[-\s]?tier|macro|mega)\s*(kol)?\b/gi,

  // Platform: tiktok, instagram, youtube, facebook
  platform: /\b(tiktok|ig|instagram|youtube|facebook|fb)\b/gi,

  // Location: bangkok, chiang mai, phuket, etc.
  location:
    /\b(bangkok|bkk|chiang\s*mai|phuket|chonburi|korat|nakhon\s*ratchasima|hua\s*hin|pattaya)\b/gi,

  // Followers: 100k, 1m, >100k, <500k, 100k-500k
  followers:
    /([><]=?|between)?\s*(\d+(?:\.\d+)?)\s*(k|m|thousand|million)?\s*(?:to|-)\s*(\d+(?:\.\d+)?)?\s*(k|m|thousand|million)?\s*(?:followers?|fans?)?/gi,
  followersSingle: /([><]=?)\s*(\d+(?:\.\d+)?)\s*(k|m|thousand|million)?\s*(?:followers?|fans?)?/gi,

  // Engagement: >5% engagement, 3-10%
  engagement: /([><]=?)\s*(\d+(?:\.\d+)?)\s*%?\s*(?:engagement|er)/gi,

  // Content type: live, video, content creator
  contentType: /\b(live|video|content)\s*(?:creator|seller|streamer)?\b/gi,

  // Has contact: line, phone, email, contact
  hasContact: /\b(has\s*)?(line|phone|email|contact)\b/gi,

  // Category keywords
  categories:
    /\b(beauty|fashion|food|tech|gaming|fitness|travel|lifestyle|mom|parenting|finance|crypto|business|education|entertainment|comedy|music)\b/gi,
};

const PLATFORM_ALIASES: Record<string, string> = {
  ig: "Instagram",
  fb: "Facebook",
};

const LOCATION_ALIASES: Record<string, string> = {
  bkk: "Bangkok",
};

export function parseSmartSearch(input: string): SearchFilters {
  const filters: SearchFilters = {};
  let remainingQuery = input.toLowerCase().trim();

  // Extract tier
  const tierMatch = remainingQuery.match(/\b(nano|micro|mid[-\s]?tier|macro|mega)\b/i);
  if (tierMatch) {
    filters.tier = tierMatch[1].replace(/[-\s]?tier/i, "");
    filters.tier = filters.tier.charAt(0).toUpperCase() + filters.tier.slice(1);
    if (filters.tier !== "Mid") filters.tier += " KOL";
    else filters.tier = "Mid-tier";
    remainingQuery = remainingQuery.replace(tierMatch[0], "");
  }

  // Extract platform
  const platformMatch = remainingQuery.match(/\b(tiktok|ig|instagram|youtube|facebook|fb)\b/i);
  if (platformMatch) {
    const p = platformMatch[1].toLowerCase();
    filters.platform = PLATFORM_ALIASES[p] || p.charAt(0).toUpperCase() + p.slice(1);
    remainingQuery = remainingQuery.replace(platformMatch[0], "");
  }

  // Extract location
  const locationMatch = remainingQuery.match(
    /\b(bangkok|bkk|chiang\s*mai|phuket|chonburi|korat|nakhon\s*ratchasima|hua\s*hin|pattaya)\b/i
  );
  if (locationMatch) {
    const loc = locationMatch[1].toLowerCase();
    filters.location = LOCATION_ALIASES[loc] || loc.charAt(0).toUpperCase() + loc.slice(1);
    remainingQuery = remainingQuery.replace(locationMatch[0], "");
  }

  // Extract followers range
  const followersRangeMatch = remainingQuery.match(
    /(\d+(?:\.\d+)?)\s*(k|m)?\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(k|m)?/i
  );
  if (followersRangeMatch) {
    const min = parseNumber(followersRangeMatch[1], followersRangeMatch[2]);
    const max = parseNumber(followersRangeMatch[3], followersRangeMatch[4]);
    filters.minFollowers = min;
    filters.maxFollowers = max;
    remainingQuery = remainingQuery.replace(followersRangeMatch[0], "");
  } else {
    // Single follower threshold
    const followersMatch = remainingQuery.match(
      /([><]=?)\s*(\d+(?:\.\d+)?)\s*(k|m)?\s*(?:followers?|fans?)?/i
    );
    if (followersMatch) {
      const num = parseNumber(followersMatch[2], followersMatch[3]);
      if (followersMatch[1].includes(">")) {
        filters.minFollowers = num;
      } else if (followersMatch[1].includes("<")) {
        filters.maxFollowers = num;
      }
      remainingQuery = remainingQuery.replace(followersMatch[0], "");
    }
  }

  // Extract engagement
  const engagementMatch = remainingQuery.match(
    /([><]=?)\s*(\d+(?:\.\d+)?)\s*%?\s*(?:engagement)?/i
  );
  if (engagementMatch) {
    const num = parseFloat(engagementMatch[2]);
    if (engagementMatch[1].includes(">")) {
      filters.minEngagement = num;
    }
    remainingQuery = remainingQuery.replace(engagementMatch[0], "");
  }

  // Extract content type
  const contentMatch = remainingQuery.match(
    /\b(live|video|content)\s*(?:creator|seller|streamer)?\b/i
  );
  if (contentMatch) {
    const type = contentMatch[1].toLowerCase();
    filters.kolType =
      type === "live" ? "Live Creator" : type === "video" ? "Video Creator" : "Content Creator";
    remainingQuery = remainingQuery.replace(contentMatch[0], "");
  }

  // Extract category
  const categoryMatch = remainingQuery.match(
    /\b(beauty|fashion|food|tech|gaming|fitness|travel|lifestyle|mom|parenting|finance|crypto|business|education|entertainment|comedy|music)\b/i
  );
  if (categoryMatch) {
    filters.category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1);
    remainingQuery = remainingQuery.replace(categoryMatch[0], "");
  }

  // Check for contact filter
  if (remainingQuery.match(/\b(has\s+)?(line|phone|email|contact)\b/i)) {
    filters.hasContact = true;
    remainingQuery = remainingQuery.replace(/\b(has\s+)?(line|phone|email|contact)\b/gi, "");
  }

  // Clean up remaining query
  filters.query = remainingQuery.trim().replace(/\s+/g, " ") || undefined;

  return filters;
}

function parseNumber(value: string, unit?: string): number {
  const num = parseFloat(value);
  if (!unit) return num;
  const u = unit.toLowerCase();
  if (u === "k" || u === "thousand") return num * 1000;
  if (u === "m" || u === "million") return num * 1000000;
  return num;
}

export function applySmartFilters(kols: ApiKOL[], filters: SearchFilters): ApiKOL[] {
  return kols.filter((kol) => {
    // Text search on name/handle
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchName = kol.name?.toLowerCase().includes(q);
      const matchHandle = kol.handle?.toLowerCase().includes(q);
      if (!matchName && !matchHandle) return false;
    }

    // Tier filter
    if (filters.tier && !kol.tier?.toLowerCase().includes(filters.tier.toLowerCase())) {
      return false;
    }

    // Platform filter
    if (filters.platform && !kol.platform?.toLowerCase().includes(filters.platform.toLowerCase())) {
      return false;
    }

    // Category filter
    if (
      filters.category &&
      !kol.categories?.some((c) => c.toLowerCase().includes(filters.category!.toLowerCase()))
    ) {
      return false;
    }

    // Location filter
    if (filters.location && !kol.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Followers range
    if (filters.minFollowers && kol.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && kol.followers > filters.maxFollowers) return false;

    // Engagement
    if (filters.minEngagement && kol.engagementRate < filters.minEngagement) return false;

    // KOL Type
    if (filters.kolType && !kol.kolType?.toLowerCase().includes(filters.kolType.toLowerCase())) {
      return false;
    }

    // Has contact
    if (filters.hasContact) {
      const hasContact = kol.contact?.lineId || kol.contact?.phone || kol.contact?.email;
      if (!hasContact) return false;
    }

    return true;
  });
}

export function getSearchSuggestions(kols: ApiKOL[], partial: string): string[] {
  const q = partial.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const suggestions = new Set<string>();

  // Popular categories
  const categories = new Set(kols.flatMap((k) => k.categories || []));
  categories.forEach((cat) => {
    if (cat.toLowerCase().startsWith(q)) suggestions.add(cat);
  });

  // Locations
  const locations = new Set(kols.map((k) => k.location).filter(Boolean));
  locations.forEach((loc) => {
    if (loc!.toLowerCase().startsWith(q)) suggestions.add(loc!);
  });

  // Tiers
  const tiers = ["Nano KOL", "Micro KOL", "Mid-tier", "Macro KOL", "Mega KOL"];
  tiers.forEach((tier) => {
    if (tier.toLowerCase().includes(q)) suggestions.add(tier);
  });

  // Platforms
  const platforms = ["TikTok", "Instagram", "YouTube", "Facebook"];
  platforms.forEach((p) => {
    if (p.toLowerCase().includes(q)) suggestions.add(p);
  });

  // Smart patterns
  if (q.includes("live")) suggestions.add("Live Creator");
  if (q.includes("video")) suggestions.add("Video Creator");
  if (q.includes("100k")) suggestions.add(">100k followers");
  if (q.includes("1m")) suggestions.add(">1M followers");

  return Array.from(suggestions).slice(0, 8);
}

// Local storage for recent searches
const RECENT_SEARCHES_KEY = "kol-recent-searches";
const MAX_RECENT = 10;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches();
  const updated = [query, ...recent.filter((r) => r !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}
