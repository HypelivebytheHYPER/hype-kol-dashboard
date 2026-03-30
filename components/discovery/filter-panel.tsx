/**
 * Filter Panel Component
 * Filters for KOL discovery
 */

"use client";

import { useState } from "react";

interface Filters {
  gmvRange: [number, number];
  followersRange: [number, number];
  engagementRange: [number, number];
  platforms: string[];
  categories: string[];
  tiers: string[];
}

const PLATFORMS = ["TikTok", "Shopee", "Lazada", "Instagram", "YouTube"];
import { CATEGORIES as ALL_CATS } from "@/lib/categories";
const CATEGORIES = ALL_CATS.map((c) => c.label);
const TIERS = ["S", "A", "B", "C"];

export function FilterPanel() {
  const [filters, setFilters] = useState<Filters>({
    gmvRange: [0, 10000000],
    followersRange: [0, 10000000],
    engagementRange: [0, 20],
    platforms: [],
    categories: [],
    tiers: [],
  });

  const handleApply = () => {
    const queryParams = new URLSearchParams();

    if (filters.gmvRange[0] > 0) queryParams.append("gmvMin", filters.gmvRange[0].toString());
    if (filters.gmvRange[1] < 10000000)
      queryParams.append("gmvMax", filters.gmvRange[1].toString());

    if (filters.followersRange[0] > 0)
      queryParams.append("followersMin", filters.followersRange[0].toString());
    if (filters.followersRange[1] < 10000000)
      queryParams.append("followersMax", filters.followersRange[1].toString());

    if (filters.engagementRange[0] > 0)
      queryParams.append("engagementMin", filters.engagementRange[0].toString());
    if (filters.engagementRange[1] < 20)
      queryParams.append("engagementMax", filters.engagementRange[1].toString());

    if (filters.platforms.length > 0) queryParams.append("platforms", filters.platforms.join(","));
    if (filters.categories.length > 0)
      queryParams.append("categories", filters.categories.join(","));
    if (filters.tiers.length > 0) queryParams.append("tiers", filters.tiers.join(","));
  };

  return (
    <div className="space-y-4">
      {/* GMV Range */}
      <div data-testid="gmv-range-slider" className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Monthly GMV Range</label>
        <input
          type="range"
          min="0"
          max="10000000"
          value={filters.gmvRange[0]}
          onChange={(e) =>
            setFilters({
              ...filters,
              gmvRange: [Number(e.target.value), filters.gmvRange[1]],
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>฿{(filters.gmvRange[0] / 1000000).toFixed(1)}M</span>
          <span>฿{(filters.gmvRange[1] / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      {/* Followers Range */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Followers Range</label>
        <input
          type="range"
          min="0"
          max="10000000"
          value={filters.followersRange[0]}
          onChange={(e) =>
            setFilters({
              ...filters,
              followersRange: [Number(e.target.value), filters.followersRange[1]],
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{(filters.followersRange[0] / 1000000).toFixed(1)}M</span>
          <span>{(filters.followersRange[1] / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      {/* Platforms */}
      <fieldset data-testid="platform-filter" className="space-y-2">
        <legend className="text-sm font-semibold text-gray-700">Platforms</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Platform filters">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              onClick={() => {
                const updated = filters.platforms.includes(platform)
                  ? filters.platforms.filter((p) => p !== platform)
                  : [...filters.platforms, platform];
                setFilters({ ...filters, platforms: updated });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filters.platforms.includes(platform)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-pressed={filters.platforms.includes(platform)}
              aria-label={`Filter by ${platform}`}
            >
              {platform}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Categories */}
      <fieldset data-testid="category-filter" className="space-y-2">
        <legend className="text-sm font-semibold text-gray-700">Categories</legend>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Category filters">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                const updated = filters.categories.includes(category)
                  ? filters.categories.filter((c) => c !== category)
                  : [...filters.categories, category];
                setFilters({ ...filters, categories: updated });
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition text-center ${
                filters.categories.includes(category)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-pressed={filters.categories.includes(category)}
              aria-label={`Filter by ${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Tiers */}
      <fieldset data-testid="tier-filter" className="space-y-2">
        <legend className="text-sm font-semibold text-gray-700">Tiers</legend>
        <div className="flex gap-2" role="group" aria-label="Tier filters">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => {
                const updated = filters.tiers.includes(tier)
                  ? filters.tiers.filter((t) => t !== tier)
                  : [...filters.tiers, tier];
                setFilters({ ...filters, tiers: updated });
              }}
              className={`flex-1 px-3 py-2 rounded font-bold transition text-sm ${
                filters.tiers.includes(tier)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-pressed={filters.tiers.includes(tier)}
              aria-label={`Filter by tier ${tier}`}
            >
              {tier}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            setFilters({
              gmvRange: [0, 10000000],
              followersRange: [0, 10000000],
              engagementRange: [0, 20],
              platforms: [],
              categories: [],
              tiers: [],
            });
          }}
          data-testid="filter-reset-btn"
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200 transition text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          data-testid="filter-apply-btn"
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
