"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KOLFeedCard } from "@/components/kol/kol-feed-card";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { TIER_ORDER } from "@/lib/tier";
import type { Creator } from "@/lib/types/catalog";
import {
  parseSmartSearch,
  applySmartFilters,
  getSearchSuggestions,
  getRecentSearches,
  addRecentSearch,
} from "@/lib/smart-search";

type SortKey = "followers" | "gmv" | "engagement" | "revenue" | "views" | "quality";
type TypeTab = "all" | "Live Creator" | "Live Seller" | "Creator";



const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "followers", label: "Followers" },
  { key: "gmv", label: "Avg GMV" },
  { key: "engagement", label: "Engagement" },
  { key: "views", label: "Views" },
  { key: "quality", label: "Score" },
];

function getSortValue(kol: Creator, key: SortKey): number {
  switch (key) {
    case "followers":
      return kol.followers;
    case "gmv":
      return kol.avgGMV || kol.avgLiveGMV;
    case "engagement":
      return kol.engagementRate;
    case "revenue":
      return kol.stats.revenue;
    case "views":
      return kol.stats.views;
    case "quality":
      return kol.qualityScore;
  }
}

interface KOLsListClientProps {
  initialKOLs: Creator[];
  total: number;
}

export function KOLsListClient({ initialKOLs, total }: KOLsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [typeTab, setTypeTab] = useState<TypeTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const allKOLs = useMemo(() => {
    if (typeTab === "all") return initialKOLs;
    return initialKOLs.filter((k) => k.kolType === typeTab);
  }, [initialKOLs, typeTab]);

  // Derive filter option lists from the loaded data so the UI automatically
  // tracks the real Lark option sets (including future additions).
  const tiers = useMemo(() => {
    const present = new Set(initialKOLs.map((k) => k.tier).filter(Boolean));
    return TIER_ORDER.filter((t) => present.has(t));
  }, [initialKOLs]);

  const platforms = useMemo(
    () =>
      [...new Set(initialKOLs.map((k) => k.platform).filter(Boolean))].sort(),
    [initialKOLs]
  );

  // Parse smart search filters
  const smartFilters = useMemo(() => parseSmartSearch(searchQuery), [searchQuery]);

  const filtered = useMemo(() => {
    let result = allKOLs;

    // Apply smart search filters
    if (searchQuery.trim()) {
      result = applySmartFilters(result, smartFilters);
    }

    // UI filter toggles
    if (selectedTiers.length > 0) {
      result = result.filter((k) => selectedTiers.includes(k.tier));
    }
    if (selectedPlatforms.length > 0) {
      result = result.filter((k) =>
        selectedPlatforms.some((p) => k.platform?.toLowerCase().includes(p.toLowerCase()))
      );
    }
    return result;
  }, [allKOLs, smartFilters, selectedTiers, selectedPlatforms, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      return sortDesc ? vb - va : va - vb;
    });
  }, [filtered, sortBy, sortDesc]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const total = filtered.length;
    const totalFollowers = filtered.reduce((s, k) => s + k.followers, 0);
    const totalRevenue = filtered.reduce((s, k) => s + (k.stats?.revenue || 0), 0);
    const avgGMV =
      total > 0 ? filtered.reduce((s, k) => s + (k.avgGMV || k.avgLiveGMV || 0), 0) / total : 0;
    return { total, totalFollowers, totalRevenue, avgGMV };
  }, [filtered]);

  const toggleFilter = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
      setCurrentPage(1);
    },
    []
  );

  const activeFilterCount = selectedTiers.length + selectedPlatforms.length;
  const clearAllFilters = () => {
    setSelectedTiers([]);
    setSelectedPlatforms([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Load recent searches on mount
  // Update suggestions as user types
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const newSuggestions = getSearchSuggestions(allKOLs, searchQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, allKOLs]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearchSubmit = (value: string) => {
    setSearchQuery(value);
    addRecentSearch(value);
    setRecentSearches(getRecentSearches());
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Creators</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover, filter and shortlist creators
          </p>
        </div>
        <div className="flex items-baseline gap-5 sm:text-right">
          <Stat label="Database" value={formatNumber(total)} />
          <div className="w-px h-8 bg-border/30 hidden sm:block" />
          <Stat label="Reach" value={formatNumber(stats.totalFollowers)} />
          <div className="w-px h-8 bg-border/30 hidden sm:block" />
          <Stat label="Revenue" value={formatCurrency(stats.totalRevenue)} />
        </div>
      </div>

      {/* === TOOLBAR === */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Source tabs + Search - stacks on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Tabs
            value={typeTab}
            onValueChange={(v) => {
              setTypeTab(v as TypeTab);
              setCurrentPage(1);
            }}
          >
            <TabsList className="h-9 bg-muted/30 border border-border/20">
              <TabsTrigger value="all" className="text-xs px-3">
                All
              </TabsTrigger>
              <TabsTrigger value="Live Creator" className="text-xs px-3">
                Live Creator
              </TabsTrigger>
              <TabsTrigger value="Live Seller" className="text-xs px-3">
                Live Seller
              </TabsTrigger>
              <TabsTrigger value="Creator" className="text-xs px-3">
                Creator
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 relative min-w-0" ref={suggestionsRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit(searchQuery);
              }}
              onFocus={() => {
                if (suggestions.length > 0 || recentSearches.length > 0) setShowSuggestions(true);
              }}
              className="pl-9 h-10 rounded-xl bg-muted/20 border-border/20 hover:border-border/40 focus:border-border/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl border border-border/20 rounded-xl shadow-2xl z-50 py-2">
                {/* Recent searches */}
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                      Recent Searches
                    </p>
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(search)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted/40 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* Smart suggestions */}
                {searchQuery && suggestions.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                      Suggestions
                    </p>
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(suggestion)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted/40 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Smart search tips — keep examples aligned with parseSmartSearch */}
                {searchQuery && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-muted-foreground">
                    <p className="text-[10px] uppercase tracking-wider mb-2 font-medium">Smart Search Tips</p>
                    <div className="text-xs space-y-1">
                      <p>• &quot;beauty bangkok&quot; — category + location</p>
                      <p>• &quot;&gt;100k followers&quot; — follower threshold</p>
                      <p>• &quot;&gt;3% engagement&quot; — engagement threshold</p>
                      <p>• &quot;has line&quot; — require contact on file</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant={showFilters || activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 rounded-xl gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full min-w-[18px] inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-xl border border-dashed border-border/30 p-3 sm:p-4 bg-muted/20 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FilterGroup
                label="Tier"
                items={tiers}
                selected={selectedTiers}
                onToggle={(v) => toggleFilter(setSelectedTiers, v)}
                displayFn={(v) => v.replace(" KOL", "")}
              />
              <FilterGroup
                label="Platform"
                items={platforms}
                selected={selectedPlatforms}
                onToggle={(v) => toggleFilter(setSelectedPlatforms, v)}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/20 gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedTiers, ...selectedPlatforms].map((v) => (
                    <Badge key={v} variant="secondary" className="gap-1 text-xs rounded-full border-border/20">
                      {v}
                      <button
                        onClick={() => {
                          setSelectedTiers((p) => p.filter((x) => x !== v));
                          setSelectedPlatforms((p) => p.filter((x) => x !== v));
                        }}
                        aria-label={`Remove ${v} filter`}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button variant="link" size="sm" onClick={clearAllFilters} className="text-xs">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Row 2: Count + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-bold text-foreground tabular-nums">{filtered.length}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  if (sortBy === opt.key) {
                    setSortDesc(!sortDesc);
                  } else {
                    setSortBy(opt.key);
                    setSortDesc(true);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  sortBy === opt.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {opt.label}
                {sortBy === opt.key && (
                  <ChevronDown
                    className={`w-3 h-3 ml-0.5 inline transition-transform duration-200 ${!sortDesc ? "rotate-180" : ""}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === CARD GRID === */}
      <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scroll-smooth scrollbar-hide gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
        {paginated.map((kol) => (
          <div
            key={kol.id}
            className="flex-shrink-0 snap-start w-[85vw] sm:w-[46vw] md:w-full"
          >
            <KOLFeedCard kol={kol} />
          </div>
        ))}
      </div>
      {/* Mobile swipe hint */}
      <p className="flex md:hidden items-center justify-center gap-1.5 text-xs text-muted-foreground/60 -mt-1">
        <span>&larr;</span> swipe to browse <span>&rarr;</span>
      </p>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={sorted.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {sorted.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-4xl mb-3 opacity-30">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No creators match your filters
          </p>
          <Button variant="link" onClick={clearAllFilters} className="mt-3">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

/* === Sub-components === */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate font-medium">{label}</p>
      <p className="text-base sm:text-lg font-mono font-bold leading-tight truncate tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
  displayFn,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  displayFn?: (value: string) => string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
              selected.includes(item)
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent text-muted-foreground border-border/30 hover:border-border/60 hover:text-foreground"
            }`}
          >
            {displayFn ? displayFn(item) : item}
          </button>
        ))}
      </div>
    </div>
  );
}
