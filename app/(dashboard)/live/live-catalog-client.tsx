"use client";

import { useState, useMemo } from "react";
import { Search, X, Video, LayoutGrid, Network } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { CONTENT_CATEGORIES, getBrandsInCategory, type ContentCategoryId } from "@/lib/taxonomy";
import { MCVideoCard } from "./mc-video-card";
import { WireMap } from "./wire-map";
import type { LiveMC } from "@/lib/types/catalog";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
  videoUrls: Record<string, string>;
}

type ViewMode = "grid" | "wiremap";

/** Pick the best video for an MC. Match by brand name in filename when filtered. */
function pickVideo(
  mc: LiveMC,
  brand: string | null,
  category: ContentCategoryId | null
): { token: string; name: string } | null {
  if (mc.videos.length === 0) return null;

  // Direct brand match
  if (brand) {
    const q = brand.toLowerCase();
    const match = mc.videos.find((v) => v.name.toLowerCase().includes(q));
    if (match) return match;
  }

  // Category match — try brands in that category
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

export function LiveCatalogClient({ mcs, videoUrls }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");

  // Active categories (only those present in data)
  const activeCategories = useMemo(() => {
    const catSet = new Set<ContentCategoryId>();
    mcs.forEach((mc) => mc.contentCategories.forEach((c) => catSet.add(c as ContentCategoryId)));
    return CONTENT_CATEGORIES.filter((c) => catSet.has(c.id));
  }, [mcs]);

  // Brand chips — scoped to selected category
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

  // Filter: category → brand → search
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

  // Reset brand when category changes
  const handleCategorySelect = (catId: ContentCategoryId | null) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setSelectedBrand(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live MC Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MC portfolio with video references and brand experience
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setView("wiremap")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                view === "wiremap" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Wire Map
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">MCs</p>
            <p className="text-lg font-mono font-bold">{formatNumber(filtered.length)}</p>
          </div>
        </div>
      </div>

      {/* Content category chips */}
      {activeCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Brand chips (scoped to category) */}
      {visibleBrands.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
                selectedBrand === brand
                  ? "bg-foreground text-background"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {mcs.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
      )}

      {/* Wire Map view */}
      {view === "wiremap" && <WireMap mcs={filtered} selectedCategory={selectedCategory} />}

      {/* Grid view — plain CSS grid (10 items fit without virtualization) */}
      {view === "grid" && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((mc) => {
              const video = pickVideo(mc, selectedBrand, selectedCategory);
              return (
                <MCVideoCard
                  key={mc.id}
                  mc={mc}
                  videoUrl={video ? videoUrls[video.token] : null}
                  isPlaying={playingId === mc.id}
                  onPlay={() => setPlayingId(playingId === mc.id ? null : mc.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Video className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p className="text-lg font-medium text-muted-foreground">No MCs found</p>
          </div>
        )
      )}
    </div>
  );
}
