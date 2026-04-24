"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Users,
  ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/format";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { TIER_ORDER } from "@/lib/tier";
import type { Creator } from "@/lib/types/catalog";
import { parseSmartSearch, applySmartFilters } from "@/lib/smart-search";
import { KOLFeedCard } from "@/components/kol/kol-feed-card";
import { cn } from "@/lib/cn";

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

const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Live Creator", label: "Live Creator" },
  { value: "Live Seller", label: "Live Seller" },
  { value: "Creator", label: "Creator" },
];

function getSortValue(kol: Creator, key: SortKey): number {
  switch (key) {
    case "followers": return kol.followers;
    case "gmv": return kol.avgGMV || kol.avgLiveGMV;
    case "engagement": return kol.engagementRate;
    case "revenue": return kol.stats.revenue;
    case "views": return kol.stats.views;
    case "quality": return kol.qualityScore;
  }
}

interface KOLsListClientProps {
  initialKOLs: Creator[];
  total: number;
}

export function KOLsListClient({ initialKOLs, total }: KOLsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [hidePlaceholders, setHidePlaceholders] = useState(false);
  const [typeTab, setTypeTab] = useState<TypeTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);

  const allKOLs = useMemo(() => {
    if (typeTab === "all") return initialKOLs;
    return initialKOLs.filter((k) => k.kolType === typeTab);
  }, [initialKOLs, typeTab]);

  const tiers = useMemo(() => {
    const present = new Set(initialKOLs.map((k) => k.tier).filter(Boolean));
    return TIER_ORDER.filter((t) => present.has(t));
  }, [initialKOLs]);

  const platforms = useMemo(
    () => [...new Set(initialKOLs.map((k) => k.platform).filter(Boolean))].sort(),
    [initialKOLs]
  );

  const smartFilters = useMemo(() => parseSmartSearch(searchQuery), [searchQuery]);

  const filtered = useMemo(() => {
    let result = allKOLs;
    if (searchQuery.trim()) result = applySmartFilters(result, smartFilters);
    if (selectedTiers.length > 0) result = result.filter((k) => selectedTiers.includes(k.tier));
    if (selectedPlatforms.length > 0) {
      result = result.filter((k) =>
        selectedPlatforms.some((p) => k.platform?.toLowerCase().includes(p.toLowerCase()))
      );
    }
    if (hidePlaceholders) result = result.filter((k) => !!k.image);
    return result;
  }, [allKOLs, smartFilters, selectedTiers, selectedPlatforms, searchQuery, hidePlaceholders]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      return sortDesc ? vb - va : va - vb;
    });
  }, [filtered, sortBy, sortDesc]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const withPhotoCount = useMemo(() => initialKOLs.filter((k) => !!k.image).length, [initialKOLs]);

  const toggleFilter = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
      setCurrentPage(1);
    },
    []
  );

  const activeFilterCount = selectedTiers.length + selectedPlatforms.length + (hidePlaceholders ? 1 : 0);
  const clearAllFilters = () => {
    setSelectedTiers([]);
    setSelectedPlatforms([]);
    setHidePlaceholders(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in">
      {/* ── Mobile Filter Toggle ── */}
      <div className="lg:hidden flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          className="h-10 rounded-xl gap-2 active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full min-w-[18px] inline-flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-primary font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* ── Sidebar Filters ── */}
      <aside
        className={cn(
          "lg:w-64 shrink-0 flex-col gap-6",
          showSidebar ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Type Tabs */}
        <div className="flex flex-col gap-2" role="tablist" aria-label="Creator type">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</p>
          <div className="flex flex-col gap-0.5 relative">
            {TYPE_TABS.map((tab) => {
              const isActive = typeTab === tab.value;
              const count = tab.value === "all"
                ? initialKOLs.length
                : initialKOLs.filter((k) => k.kolType === tab.value).length;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setTypeTab(tab.value);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "group relative text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out active:scale-[0.98] overflow-hidden",
                    isActive
                      ? "text-primary translate-x-0.5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {/* Sliding background pill */}
                  <span
                    className={cn(
                      "absolute inset-0 rounded-xl transition-all duration-300 ease-out",
                      isActive ? "bg-primary/10 opacity-100" : "bg-transparent opacity-0"
                    )}
                  />
                  {/* Left accent indicator */}
                  <span
                    className={cn(
                      "absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary transition-all duration-300 ease-out",
                      isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    )}
                  />
                  {/* Content */}
                  <span className="relative flex items-center justify-between">
                    <span className={cn("transition-colors duration-300", isActive && "font-semibold")}>
                      {tab.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs transition-all duration-300",
                        isActive
                          ? "text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full font-mono"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Filter */}
        {tiers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <FilterChip
                  key={tier}
                  label={tier.replace(" KOL", "")}
                  active={selectedTiers.includes(tier)}
                  onClick={() => toggleFilter(setSelectedTiers, tier)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Platform Filter */}
        {platforms.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <FilterChip
                  key={platform}
                  label={platform}
                  active={selectedPlatforms.includes(platform)}
                  onClick={() => toggleFilter(setSelectedPlatforms, platform)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Photo Filter */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photos</p>
          <button
            onClick={() => {
              setHidePlaceholders((v) => !v);
              setCurrentPage(1);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]",
              hidePlaceholders
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <ImageIcon className="size-4" />
            With photo only
            <span className="ml-auto text-xs text-muted-foreground">{withPhotoCount}</span>
          </button>
        </div>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary font-medium hover:text-primary/80 transition-colors text-left px-3"
          >
            Clear all filters
          </button>
        )}
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Header + Search + Sort */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Creators</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {formatNumber(total)} talent in our curated roster
              </p>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-medium hover:bg-muted/60 active:scale-95 transition-all">
                Sort by: {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.key}
                    onClick={() => {
                      if (sortBy === opt.key) setSortDesc(!sortDesc);
                      else { setSortBy(opt.key); setSortDesc(true); }
                      setCurrentPage(1);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className={cn(sortBy === opt.key && "text-primary font-medium")}>{opt.label}</span>
                    {sortBy === opt.key && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search creators, brands, categories..."
              className="pl-11 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-foreground/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {hidePlaceholders && (
                <FilterTag onRemove={() => setHidePlaceholders(false)}>With photo</FilterTag>
              )}
              {selectedTiers.map((t) => (
                <FilterTag key={t} onRemove={() => toggleFilter(setSelectedTiers, t)}>
                  {t.replace(" KOL", "")}
                </FilterTag>
              ))}
              {selectedPlatforms.map((p) => (
                <FilterTag key={p} onRemove={() => toggleFilter(setSelectedPlatforms, p)}>
                  {p}
                </FilterTag>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-mono font-bold text-foreground">{paginated.length}</span> of{" "}
          <span className="font-mono font-bold text-foreground">{sorted.length}</span> results
        </p>

        {/* Card Grid */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {paginated.map((kol, index) => (
              <KOLFeedCard key={kol.id} kol={kol} priority={index < 12} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-4">
              <Users className="size-6 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">No creators found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search</p>
            <Button variant="link" onClick={clearAllFilters} className="mt-2">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border/40 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border/40 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border min-h-[32px] active:scale-95 touch-manipulation",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-transparent text-muted-foreground border-border/40 hover:border-border/70 hover:text-foreground hover:bg-muted/30"
      )}
    >
      {label}
    </button>
  );
}

function FilterTag({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {children}
      <button
        onClick={onRemove}
        aria-label={`Remove ${children} filter`}
        className="hover:text-destructive transition-colors active:scale-90"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
