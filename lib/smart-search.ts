"use client";

import type { Creator } from "./types/catalog";

interface SearchFilters {
  query?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  hasContact?: boolean;
}

// Threshold + hasContact are well-defined syntax ("> 100k", "has line").
// Category/location are NOT regex-extracted anymore — the hardcoded dicts
// missed ~50% of real Lark values and flagged phantoms like `crypto`/`comedy`
// that aren't in the data at all. Free-text remainder is matched against
// name + handle + location + categories in `applySmartFilters` instead.
export function parseSmartSearch(input: string): SearchFilters {
  const filters: SearchFilters = {};
  let remainingQuery = input.toLowerCase().trim();

  // Followers range (X to Y / X-Y)
  const followersRangeMatch = remainingQuery.match(
    /(\d+(?:\.\d+)?)\s*(k|m)?\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(k|m)?/i
  );
  if (followersRangeMatch) {
    filters.minFollowers = parseNumber(followersRangeMatch[1], followersRangeMatch[2]);
    filters.maxFollowers = parseNumber(followersRangeMatch[3], followersRangeMatch[4]);
    remainingQuery = remainingQuery.replace(followersRangeMatch[0], "");
  } else {
    const followersMatch = remainingQuery.match(
      /([><]=?)\s*(\d+(?:\.\d+)?)\s*(k|m)?\s*(?:followers?|fans?)?/i
    );
    if (followersMatch) {
      const num = parseNumber(followersMatch[2], followersMatch[3]);
      if (followersMatch[1].includes(">")) filters.minFollowers = num;
      else if (followersMatch[1].includes("<")) filters.maxFollowers = num;
      remainingQuery = remainingQuery.replace(followersMatch[0], "");
    }
  }

  // Engagement threshold (>2% etc)
  const engagementMatch = remainingQuery.match(
    /([><]=?)\s*(\d+(?:\.\d+)?)\s*%?\s*(?:engagement)?/i
  );
  if (engagementMatch && engagementMatch[1].includes(">")) {
    filters.minEngagement = parseFloat(engagementMatch[2]);
    remainingQuery = remainingQuery.replace(engagementMatch[0], "");
  }

  // Contact filter
  if (remainingQuery.match(/\b(has\s+)?(line|phone|email|contact)\b/i)) {
    filters.hasContact = true;
    remainingQuery = remainingQuery.replace(/\b(has\s+)?(line|phone|email|contact)\b/gi, "");
  }

  // Free-text remainder → name/handle/location/categories query
  const cleaned = remainingQuery.trim().replace(/\s+/g, " ");
  if (cleaned) filters.query = cleaned;

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

export function applySmartFilters(kols: Creator[], filters: SearchFilters): Creator[] {
  // Free-text tokens — ALL must match somewhere across name/handle/location/
  // categories. Splitting by whitespace lets "beauty bangkok" match both
  // dimensions without needing an explicit extraction step.
  const tokens = filters.query?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];

  return kols.filter((kol) => {
    if (tokens.length) {
      const haystack = [
        kol.name,
        kol.handle,
        kol.location,
        ...kol.categories,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }

    if (filters.minFollowers && kol.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && kol.followers > filters.maxFollowers) return false;
    if (filters.minEngagement && kol.engagementRate < filters.minEngagement) return false;

    if (filters.hasContact) {
      const hasContact = kol.contact.lineId || kol.contact.phone || kol.contact.email;
      if (!hasContact) return false;
    }

    return true;
  });
}

export function getSearchSuggestions(kols: Creator[], partial: string): string[] {
  const q = partial.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const suggestions = new Set<string>();

  // Categories that start with the query
  const categories = new Set(kols.flatMap((k) => k.categories));
  categories.forEach((cat) => {
    if (cat.toLowerCase().startsWith(q)) suggestions.add(cat);
  });

  // Locations that start with the query
  const locations = new Set(kols.map((k) => k.location).filter((l): l is string => !!l));
  locations.forEach((loc) => {
    if (loc.toLowerCase().startsWith(q)) suggestions.add(loc);
  });

  // Follower threshold shortcuts — parseSmartSearch understands these
  if (q.includes("100k")) suggestions.add(">100k followers");
  if (q.includes("1m")) suggestions.add(">1M followers");

  return Array.from(suggestions).slice(0, 8);
}

// In-memory session-scoped recent searches (no localStorage — resets on reload).
const MAX_RECENT = 10;
const recentInMemory: string[] = [];

export function getRecentSearches(): string[] {
  return recentInMemory.slice();
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const existing = recentInMemory.indexOf(q);
  if (existing !== -1) recentInMemory.splice(existing, 1);
  recentInMemory.unshift(q);
  if (recentInMemory.length > MAX_RECENT) recentInMemory.length = MAX_RECENT;
}
