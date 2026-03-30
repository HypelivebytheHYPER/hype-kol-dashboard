"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { ApiKOL } from "@/lib/lark-api";
import {
  parseSmartSearch,
  applySmartFilters,
  getSearchSuggestions,
  getRecentSearches,
  addRecentSearch,
} from "@/lib/smart-search";
// No client-side pre-computation needed

const ITEMS_PER_PAGE = 6;

type SortKey = "followers" | "gmv" | "engagement" | "revenue" | "views" | "quality";
type TypeTab = "all" | "Live Creator" | "Live Seller" | "Creator";

const TIERS = ["Mega KOL", "Macro KOL", "Micro KOL", "Nano KOL"];
const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook"];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "followers", label: "Followers" },
  { key: "gmv", label: "Avg GMV" },
  { key: "engagement", label: "Engagement" },
  { key: "views", label: "Views" },
  { key: "quality", label: "Score" },
];

function getSortValue(kol: ApiKOL, key: SortKey): number {
  switch (key) {
    case "followers":
      return kol.followers;
    case "gmv":
      return kol.avgGMV || kol.avgLiveGMV || 0;
    case "engagement":
      return kol.engagementRate;
    case "revenue":
      return kol.stats?.revenue || 0;
    case "views":
      return kol.stats?.views || 0;
    case "quality":
      return kol.qualityScore;
  }
}

interface KOLsListClientProps {
  initialKOLs: ApiKOL[];
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

  // Parse smart search filters
  const smartFilters = useMemo(() => parseSmartSearch(searchQuery), [searchQuery]);

  const filtered = useMemo(() => {
    let result = allKOLs;

    // Apply smart search filters
    if (searchQuery.trim()) {
      result = applySmartFilters(result, smartFilters);
    }

    // Apply UI filter toggles (if different from smart search)
    if (selectedTiers.length > 0 && !smartFilters.tier) {
      result = result.filter((k) => selectedTiers.includes(k.tier));
    }
    if (selectedPlatforms.length > 0 && !smartFilters.platform) {
      result = result.filter((k) =>
        selectedPlatforms.some((p) => k.platform?.toLowerCase().includes(p.toLowerCase()))
      );
    }
    return result;
  }, [allKOLs, smartFilters, selectedTiers, selectedPlatforms]);

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
    (_list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
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
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">KOLs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover, filter and shortlist creators
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <Stat
            label="Database"
            value={formatNumber(total)}
          />
          <Stat label="Reach" value={formatNumber(stats.totalFollowers)} />
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
            <TabsList className="h-9">
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
              placeholder="Try: beauty micro bangkok or >100k followers or live creator..."
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
              className="pl-9 h-10 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-lg z-50 py-2">
                {/* Recent searches */}
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Recent Searches
                    </p>
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(search)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
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
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Suggestions
                    </p>
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(suggestion)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Smart search tips */}
                {searchQuery && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-muted-foreground">
                    <p className="text-[10px] uppercase tracking-wider mb-2">Smart Search Tips</p>
                    <div className="text-xs space-y-1">
                      <p>• &quot;beauty micro bangkok&quot; - category + tier + location</p>
                      <p>• &quot;&gt;100k followers&quot; - follower threshold</p>
                      <p>• &quot;live creator&quot; - content type</p>
                      <p>• &quot;tiktok nano&quot; - platform + tier</p>
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
          <div className="rounded-xl border border-dashed border-border p-3 sm:p-4 bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FilterGroup
                label="Tier"
                items={TIERS}
                selected={selectedTiers}
                onToggle={(v) => toggleFilter(selectedTiers, setSelectedTiers, v)}
                displayFn={(v) => v.replace(" KOL", "")}
              />
              <FilterGroup
                label="Platform"
                items={PLATFORMS}
                selected={selectedPlatforms}
                onToggle={(v) => toggleFilter(selectedPlatforms, setSelectedPlatforms, v)}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/40 gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedTiers, ...selectedPlatforms].map((v) => (
                    <Badge key={v} variant="secondary" className="gap-1 text-xs rounded-full">
                      {v}
                      <button
                        onClick={() => {
                          setSelectedTiers((p) => p.filter((x) => x !== v));
                          setSelectedPlatforms((p) => p.filter((x) => x !== v));
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Row 2: Count + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-bold text-foreground">{filtered.length}</span>{" "}
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
                {sortBy === opt.key && (
                  <ChevronDown
                    className={`w-3 h-3 ml-0.5 inline transition-transform ${!sortDesc ? "rotate-180" : ""}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === CARD GRID === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scroll-smooth scrollbar-hide gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0"
        >
          {paginated.map((kol, index) => (
            <div
              key={kol.id}
              className="flex-shrink-0 snap-start w-[78vw] sm:w-[46vw] md:w-full"
            >
              <KOLFeedCard kol={kol} index={index} priority={index === 0} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
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
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-30">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No KOLs match your filters
          </p>
          <Button variant="ghost" onClick={clearAllFilters} className="mt-3">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

/* === Sub-components === */

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="text-base sm:text-lg font-mono font-bold leading-tight truncate">
        {value}
        {suffix && <span className="text-muted-foreground text-sm">{suffix}</span>}
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
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              selected.includes(item)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {displayFn ? displayFn(item) : item}
          </button>
        ))}
      </div>
    </div>
  );
}
