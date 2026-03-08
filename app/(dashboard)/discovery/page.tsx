"use client";

import { useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KOLCard } from "@/components/kol/kol-card";
import { KOLFilter, Tier, Platform, Category } from "@/lib/types";

const tiers: Tier[] = ["nano", "micro", "mid", "macro", "mega"];
const platforms: Platform[] = ["tiktok", "instagram", "youtube", "facebook"];
const categories: Category[] = ["beauty", "tech", "fmcg", "lifestyle", "fashion", "food"];
const locations = ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen"];

const mockKOLs = [
  {
    id: "1",
    name: "Mintra",
    handle: "@mintrako8764",
    platform: "tiktok",
    tier: "macro",
    followers: 506000,
    engagementRate: 10.8,
    avgGMV: 1900000,
    qualityScore: 3.5,
    categories: ["beauty", "lifestyle"],
    location: "Bangkok",
    isLiveNow: true,
    liveStats: {
      currentViewers: 12000,
      gmv: 450000,
      startedAt: new Date().toISOString(),
      duration: 45,
      productsSold: 156,
    },
  },
  {
    id: "2",
    name: "Winwin Center",
    handle: "@winwincenter",
    platform: "tiktok",
    tier: "macro",
    followers: 420000,
    engagementRate: 8.5,
    avgGMV: 1200000,
    qualityScore: 4.0,
    categories: ["fashion", "lifestyle"],
    location: "Bangkok",
    isLiveNow: true,
    liveStats: {
      currentViewers: 8500,
      gmv: 380000,
      startedAt: new Date().toISOString(),
      duration: 32,
      productsSold: 98,
    },
  },
  {
    id: "3",
    name: "TechReviewer Pro",
    handle: "@techreviewer_pro",
    platform: "youtube",
    tier: "mid",
    followers: 180000,
    engagementRate: 5.2,
    avgGMV: 800000,
    qualityScore: 4.5,
    categories: ["tech"],
    location: "Chiang Mai",
    isLiveNow: false,
  },
  {
    id: "4",
    name: "Beauty Blogger Sarah",
    handle: "@sarahbeauty",
    platform: "instagram",
    tier: "micro",
    followers: 85000,
    engagementRate: 12.3,
    avgGMV: 450000,
    qualityScore: 4.2,
    categories: ["beauty", "fashion"],
    location: "Bangkok",
    isLiveNow: false,
  },
  {
    id: "5",
    name: "Foodie Explorer",
    handle: "@foodie_explorer",
    platform: "tiktok",
    tier: "mega",
    followers: 2500000,
    engagementRate: 6.8,
    avgGMV: 3500000,
    qualityScore: 3.8,
    categories: ["food", "lifestyle"],
    location: "Phuket",
    isLiveNow: false,
  },
  {
    id: "6",
    name: "Parenting Tips Mom",
    handle: "@parenting_tips",
    platform: "facebook",
    tier: "micro",
    followers: 65000,
    engagementRate: 9.1,
    avgGMV: 320000,
    qualityScore: 4.3,
    categories: ["lifestyle"],
    location: "Khon Kaen",
    isLiveNow: false,
  },
];

export default function DiscoveryPage() {
  const [filters, setFilters] = useState<KOLFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const toggleFilter = (key: keyof KOLFilter, value: Tier | Platform | Category | string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value as string)
        ? current.filter((v) => v !== value)
        : [...current, value as string];
      return { ...prev, [key]: updated };
    });
  };

  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display font-bold">Discovery Engine</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect KOLs for your campaigns
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) =>
            Array.isArray(values)
              ? values.map((value) => (
                  <Badge key={`${key}-${value}`} variant="secondary">
                    {value}
                    <button
                      onClick={() => toggleFilter(key as keyof KOLFilter, value)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              : null
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tier Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Tier</h4>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map((tier) => (
                      <Button
                        key={tier}
                        variant={
                          filters.tiers?.includes(tier) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("tiers", tier)}
                      >
                        {tier}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Platform Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Platform</h4>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <Button
                        key={platform}
                        variant={
                          filters.platforms?.includes(platform)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("platforms", platform)}
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          filters.categories?.includes(category)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("categories", category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Location</h4>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <Button
                        key={location}
                        variant={
                          filters.locations?.includes(location)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("locations", location)}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Live Only Toggle */}
                <div>
                  <Button
                    variant={filters.isLiveOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        isLiveOnly: !prev.isLiveOnly,
                      }))
                    }
                    className="w-full"
                  >
                    Live Now Only
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Grid */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {mockKOLs.length} results found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select className="bg-transparent text-sm border-none focus:outline-none">
                <option>Relevance</option>
                <option>Followers (High to Low)</option>
                <option>GMV (High to Low)</option>
                <option>Engagement Rate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockKOLs.map((kol) => (
              <KOLCard key={kol.id} kol={kol} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
