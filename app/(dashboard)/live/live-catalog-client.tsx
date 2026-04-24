"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search,
  X,
  LayoutGrid,
  Network,
  Sparkles,
  Users,
  Store,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, getBrandsInCategory, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, CARD, TOGGLE, FILTER_INACTIVE, STAT_LABEL, EMPTY_ICON } from "@/lib/design-tokens";
import { MCListItem } from "./mc-list-item";
import { MCDetailPanel } from "./mc-detail-panel";
import { WireMap } from "./wire-map";
import type { LiveMC } from "@/lib/types/catalog";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
}

type ViewMode = "list" | "wiremap";

function pickVideo(
  mc: LiveMC,
  brand: string | null,
  category: ContentCategoryId | null
): { token: string; name: string } | null {
  if (mc.videos.length === 0) return null;
  if (brand) {
    const q = brand.toLowerCase();
    const match = mc.videos.find((v) => v.name.toLowerCase().includes(q));
    if (match) return match;
  }
  if (category) {
    const catBrands = getBrandsInCategory(category).map((b) => b.toLowerCase());
    const match = mc.videos.find((v) => {
      const name = v.name.toLowerCase();
      return catBrands.some((b) => name.includes(b));
    });
    if (match) return match;
  }
  return mc.videos[0];
}

export function LiveCatalogClient({ mcs }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");

  // Active categories
  const activeCategories = useMemo(() => {
    const catSet = new Set<ContentCategoryId>();
    mcs.forEach((mc) => mc.contentCategories.forEach((c) => catSet.add(c as ContentCategoryId)));
    return CONTENT_CATEGORIES.filter((c) => catSet.has(c.id));
  }, [mcs]);

  // Brand chips
  const visibleBrands = useMemo(() => {
    const counts = new Map<string, number>();
    const scope = selectedCategory ? getBrandsInCategory(selectedCategory) : null;
    mcs.forEach((mc) =>
      mc.brands.forEach((b) => {
        if (!scope || scope.includes(b)) counts.set(b, (counts.get(b) || 0) + 1);
      })
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [mcs, selectedCategory]);

  // Filter pipeline
  const filtered = useMemo(() => {
    let result = mcs;
    if (selectedCategory) {
      result = result.filter((mc) => mc.contentCategories.includes(selectedCategory));
    }
    if (selectedBrand) {
      result = result.filter((mc) => mc.brands.includes(selectedBrand));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (mc) =>
          mc.handle.toLowerCase().includes(q) ||
          mc.brands.some((b) => b.toLowerCase().includes(q))
      );
    }
    return result;
  }, [mcs, selectedCategory, selectedBrand, searchQuery]);

  // Derive selected MC from current selection + filtered list
  const selectedMC = useMemo(() => {
    const found = filtered.find((mc) => mc.id === selectedId);
    return found ?? filtered[0] ?? null;
  }, [filtered, selectedId]);

  // Auto-select first item when filtered set changes and current selection is gone
  const prevFilteredRef = useRef(filtered);
  useEffect(() => {
    const prevIds = new Set(prevFilteredRef.current.map((m) => m.id));
    const currentIds = new Set(filtered.map((m) => m.id));
    const changed =
      prevIds.size !== currentIds.size ||
      [...prevIds].some((id) => !currentIds.has(id));

    if (changed) {
      prevFilteredRef.current = filtered;
      const stillValid = filtered.some((mc) => mc.id === selectedId);
      if (!stillValid && filtered.length > 0) {
        setSelectedId(filtered[0].id);
      }
    }
  }, [filtered, selectedId]);

  // Stats
  const totalBrands = useMemo(() => new Set(mcs.flatMap((mc) => mc.brands)).size, [mcs]);
  const totalCategories = useMemo(() => new Set(mcs.flatMap((mc) => mc.contentCategories)).size, [mcs]);

  const handleCategorySelect = (catId: ContentCategoryId | null) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setSelectedBrand(null);
  };

  const handlePlay = useCallback(
    (mcId: string) => {
      setSelectedId(mcId);
      setPlayingId((prev) => (prev === mcId ? null : mcId));
    },
    []
  );

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* ── Hero Header ── */}
      <div className={CARD.hero}>
        <div className="absolute top-0 right-0 size-96 bg-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-64 bg-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="flex flex-col gap-3">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  <Sparkles className="size-3 text-primary" />
                  Premium Talent
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Live MC Catalog
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Discover our curated roster of professional live commerce hosts.
                  Each MC is vetted for engagement, conversion, and brand alignment.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start text-muted-foreground mb-0.5">
                  <Users className="size-3.5" />
                  <span className={cn(STAT_LABEL)}>MCs</span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums">{formatNumber(mcs.length)}</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start text-muted-foreground mb-0.5">
                  <Store className="size-3.5" />
                  <span className={cn(STAT_LABEL)}>Brands</span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums">{formatNumber(totalBrands)}</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center sm:text-left hidden sm:block">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start text-muted-foreground mb-0.5">
                  <LayoutGrid className="size-3.5" />
                  <span className={cn(STAT_LABEL)}>Categories</span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums">{formatNumber(totalCategories)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MCs or brands..."
            className="pl-10 h-11 rounded-xl bg-muted/50 border-border focus:border-foreground/20 focus:bg-muted transition-colors placeholder:text-muted-foreground/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* View toggle + count */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border overflow-hidden bg-muted/30">
            <button
              onClick={() => setView("list")}
              className={cn(TOGGLE.base, view === "list" ? TOGGLE.active : TOGGLE.inactive)}
            >
              <LayoutGrid className="size-3.5" /> List
            </button>
            <button
              onClick={() => setView("wiremap")}
              className={cn(TOGGLE.base, view === "wiremap" ? TOGGLE.active : TOGGLE.inactive)}
            >
              <Network className="size-3.5" /> Wire Map
            </button>
          </div>
          <div className="hidden sm:block text-right">
            <p className={cn("text-muted-foreground", STAT_LABEL)}>Results</p>
            <p className="text-sm font-mono font-bold tabular-nums">{formatNumber(filtered.length)}</p>
          </div>
        </div>
      </div>

      {/* ── Category Filter ── */}
      {activeCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
              !selectedCategory
                ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
            )}
          >
            All Categories
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2",
                selectedCategory === cat.id
                  ? cn(
                      "text-foreground shadow-lg border",
                      CATEGORY_STYLES[cat.id].filterActiveBg,
                      CATEGORY_STYLES[cat.id].filterActiveBorder,
                      CATEGORY_STYLES[cat.id].filterActiveShadow
                    )
                  : FILTER_INACTIVE
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  selectedCategory === cat.id && CATEGORY_STYLES[cat.id].dot
                )}
              />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Brand Chips ── */}
      {visibleBrands.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                selectedBrand === brand
                  ? "bg-foreground text-background shadow-md shadow-foreground/10"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* ── Wire Map view ── */}
      {view === "wiremap" && <WireMap mcs={filtered} selectedCategory={selectedCategory} />}

      {/* ── List + Detail Split View ── */}
      {view === "list" && (
        <div className={cn("flex flex-col lg:flex-row gap-0 min-h-[600px]", CARD.base)}>
          {/* Left: MC List */}
          <div className="flex flex-col w-full lg:w-[380px] xl:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-border">
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                MC Directory
              </span>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 max-h-[600px] lg:max-h-[700px]">
              {filtered.length > 0 ? (
                filtered.map((mc, i) => {
                  const video = pickVideo(mc, selectedBrand, selectedCategory);
                  return (
                    <MCListItem
                      key={mc.id}
                      mc={mc}
                      isSelected={selectedMC?.id === mc.id}
                      isPlaying={playingId === mc.id}
                      hasVideo={!!video}
                      onSelect={() => setSelectedId(mc.id)}
                      onPlay={() => handlePlay(mc.id)}
                      index={i}
                    />
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={cn(EMPTY_ICON.sm, "mb-4")}>
                    <Search className="size-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">No MCs found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters or search</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0 bg-background">
            {selectedMC ? (
              <MCDetailPanel
                mc={selectedMC}

                isPlaying={playingId === selectedMC.id}
                onTogglePlay={() => handlePlay(selectedMC.id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className={cn(EMPTY_ICON.lg, "mb-5")}>
                  <Users className="size-8 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground mb-1">
                  Select an MC
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Choose a live commerce host from the list to view their profile, video references, and brand portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
