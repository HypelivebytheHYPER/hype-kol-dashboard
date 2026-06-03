"use client";

import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import { Search, X, Users, LayoutGrid, List, Map as MapIcon, CheckSquare, Square, ArrowUpDown, Send, Images } from "lucide-react";
import { Input, Button, SlideshowGrid } from "@/components/ui";

import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, getBrandsInCategory, type ContentCategoryId } from "@/lib/taxonomy";
import { WIDTH, CATEGORY_STYLES, DURATION, OVERLAY, Z_INDEX, SHADOW, RADIUS } from "@/lib/design-tokens";
import { FOCUS_TRAP_DELAY_MS, VISIBLE_BRAND_LIMIT } from "@/lib/constants";
import { MCCard, MCDetailPanel } from "./mc-views";
import { WireMap } from "./wire-map";
import { MCRequestForm } from "./mc-request-form";
import type { LiveMC } from "@/lib/types";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
}

type ViewMode = "list" | "grid" | "slideshow" | "wiremap";
type SortMode = "default" | "name-asc" | "name-desc";



export function LiveCatalogClient({ mcs }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("slideshow");
  const [showDetail, setShowDetail] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("default");


  const activeCategories = useMemo(() => {
    const catSet = new Set<ContentCategoryId>();
    mcs.forEach((mc) => mc.contentCategories.forEach((c) => catSet.add(c as ContentCategoryId)));
    return CONTENT_CATEGORIES.filter((c) => catSet.has(c.id));
  }, [mcs]);

  const deferredSearch = useDeferredValue(searchQuery);

  const filtered = useMemo(() => {
    let result = mcs;
    if (selectedCategory) {
      result = result.filter((mc) => mc.contentCategories.includes(selectedCategory));
    }
    if (selectedBrand) {
      result = result.filter((mc) => mc.brands.includes(selectedBrand));
    }
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      result = result.filter(
        (mc) =>
          mc.handle.toLowerCase().includes(q) ||
          mc.brands.some((b) => b.toLowerCase().includes(q))
      );
    }
    if (sortMode === "name-asc") {
      result = [...result].sort((a, b) => a.handle.localeCompare(b.handle, "th", { sensitivity: "base" }));
    } else if (sortMode === "name-desc") {
      result = [...result].sort((a, b) => b.handle.localeCompare(a.handle, "th", { sensitivity: "base" }));
    }
    return result;
  }, [mcs, selectedCategory, selectedBrand, searchQuery, sortMode]);

  const visibleBrands = useMemo(() => {
    const counts = new Map<string, number>();
    const scope = selectedCategory ? getBrandsInCategory(selectedCategory) : null;
    filtered.forEach((mc) =>
      mc.brands.forEach((b) => {
        if (!scope || scope.includes(b)) counts.set(b, (counts.get(b) ?? 0) + 1);
      })
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, VISIBLE_BRAND_LIMIT)
      .map(([name]) => name);
  }, [filtered, selectedCategory]);

  const selectedMC = useMemo(() => {
    return filtered.find((mc) => mc.id === selectedId) ?? null;
  }, [filtered, selectedId]);

  const selectedMCs = useMemo(() => {
    return mcs.filter((mc) => selectedIds.has(mc.id));
  }, [mcs, selectedIds]);

  const prevFilteredRef = useRef(filtered);
  useEffect(() => {
    const prevIds = new Set(prevFilteredRef.current.map((m) => m.id));
    const currentIds = new Set(filtered.map((m) => m.id));
    const changed = prevIds.size !== currentIds.size || [...prevIds].some((id) => !currentIds.has(id));
    if (changed) {
      const stillValid = filtered.some((mc) => mc.id === selectedId);
      if (!stillValid) {
        setShowDetail(false);
        setSelectedId(null);
      }
    }
    prevFilteredRef.current = filtered;
  }, [filtered, selectedId]);

  const totalBrands = useMemo(() => new Set(filtered.flatMap((mc) => mc.brands)).size, [filtered]);
  const totalCategories = useMemo(() => new Set(filtered.flatMap((mc) => mc.contentCategories)).size, [filtered]);

  const handleCategorySelect = (catId: ContentCategoryId | null) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setSelectedBrand(null);
  };

  const handlePlay = (mcId: string) => {
    setSelectedId(mcId);
    setPlayingId((prev) => (prev === mcId ? null : mcId));
  };

  const handleTogglePlay = (mcId: string) => {
    setPlayingId((prev) => (prev === mcId ? null : mcId));
  };

  const handleSelect = (mcId: string) => {
    setSelectedId(mcId);
    setShowDetail(true);
  };

  const handleToggleCheck = (mcId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mcId)) next.delete(mcId);
      else next.add(mcId);
      return next;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map((mc) => mc.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0);
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery("");
  };

  const toggleSort = () => {
    setSortMode((prev) => {
      if (prev === "default") return "name-asc";
      if (prev === "name-asc") return "name-desc";
      return "default";
    });
  };

  // Close detail on escape (skip if typing in input/textarea)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        setShowDetail(false);
        setShowRequestForm(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus trap for request form drawer
  useEffect(() => {
    if (!showRequestForm) return;

    const drawer = document.querySelector('[data-focus-trap="request-drawer"]');
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    // Focus first element after a short delay to ensure drawer is mounted
    const focusTimer = setTimeout(() => focusable[0].focus(), FOCUS_TRAP_DELAY_MS);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleTab);
    };
  }, [showRequestForm]);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live MC Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} MCs · {totalBrands} brands · {totalCategories} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-1.5"
          >
            {isSelectionMode ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
            {isSelectionMode ? "Done" : "Select"}
          </Button>
          <div className={`flex items-center bg-muted ${RADIUS.md} p-0.5 border border-border/40`}>
            <button
              onClick={() => setView("slideshow")}
              className={cn(
                `p-1.5 ${RADIUS.sm} transition-colors`,
                view === "slideshow" ? `bg-background ${SHADOW.sm} text-foreground` : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Slideshow view"
            >
              <Images className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                `p-1.5 ${RADIUS.sm} transition-colors`,
                view === "list" ? `bg-background ${SHADOW.sm} text-foreground` : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                `p-1.5 ${RADIUS.sm} transition-colors`,
                view === "grid" ? `bg-background ${SHADOW.sm} text-foreground` : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("wiremap")}
              className={cn(
                `p-1.5 ${RADIUS.sm} transition-colors`,
                view === "wiremap" ? `bg-background ${SHADOW.sm} text-foreground` : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Wire map view"
            >
              <MapIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            className="gap-1.5 shrink-0"
          >
            <ArrowUpDown className="size-4" />
            {sortMode === "name-asc" ? "A → Z" : sortMode === "name-desc" ? "Z → A" : "Default"}
          </Button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {activeCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const s = CATEGORY_STYLES[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                aria-pressed={isActive}
                className={cn(
                  `shrink-0 px-3 py-1.5 ${RADIUS.full} text-xs font-medium border transition-colors active:scale-95`,
                  isActive
                    ? cn(s.chipBg, s.chipText, "border-current")
                    : "bg-muted text-muted-foreground border-border hover:border-muted-foreground/30"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Brand chips */}
        {visibleBrands.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {visibleBrands.map((brand) => {
              const isActive = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(isActive ? null : brand)}
                  aria-pressed={isActive}
                  className={cn(
                    `shrink-0 px-3 py-1.5 ${RADIUS.full} text-xs font-medium border transition-colors active:scale-95`,
                    isActive
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border hover:border-muted-foreground/30"
                  )}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${RADIUS.full} text-xs font-medium bg-primary/10 text-primary border border-primary/20`}>
                {CONTENT_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                <button
                  onClick={() => setSelectedCategory(null)}
                  aria-label="Remove category filter"
                  className="hover:text-destructive active:scale-90"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {selectedBrand && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${RADIUS.full} text-xs font-medium bg-primary/10 text-primary border border-primary/20`}>
                {selectedBrand}
                <button
                  onClick={() => setSelectedBrand(null)}
                  aria-label="Remove brand filter"
                  className="hover:text-destructive active:scale-90"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-bold text-foreground">{filtered.length}</span> MCs
        </p>
        {isSelectionMode && (
          <p className="text-sm text-primary font-medium">
            {selectedIds.size} selected
          </p>
        )}
      </div>

      {/* Content + Inline Detail */}
      <div className="flex gap-0 overflow-hidden">
        {/* Main content */}
        <div className={cn(
          "flex-1 min-w-0 transition-all", DURATION.normal,
          showDetail ? "hidden lg:block" : "block"
        )}>
          {view === "wiremap" ? (
            <WireMap
              mcs={filtered}
              selectedCategory={selectedCategory}
              onSelectMC={(mcId) => {
                setSelectedId(mcId);
                setShowDetail(true);
              }}
              onSelectCategory={(catId) => {
                handleCategorySelect(catId);
              }}
              onSelectBrand={(brand) => {
                setSelectedBrand((prev) => (prev === brand ? null : brand));
              }}
            />
          ) : filtered.length > 0 ? (
            <SlideshowGrid showDetail={showDetail}>
              {filtered.map((mc) => (
                <MCCard
                  key={mc.id}
                  mc={mc}
                  isSelected={selectedMC?.id === mc.id}
                  isPlaying={playingId === mc.id}
                  isSelectionMode={isSelectionMode}
                  isChecked={selectedIds.has(mc.id)}
                  onSelect={() => handleSelect(mc.id)}
                  onPlay={() => handlePlay(mc.id)}
                  onToggleCheck={() => handleToggleCheck(mc.id)}
                />
              ))}
            </SlideshowGrid>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Inline Detail Panel */}
        <div className={cn(
          "shrink-0 lg:border-l border-border bg-background overflow-y-auto transition-all ease-out", DURATION.normal,
          showDetail ? `w-full ${WIDTH.detailPanelLg}` : "w-0"
        )}>
          {showDetail && selectedMC && (
            <div className={`p-4 sm:p-6 ${WIDTH.detailPanelMin}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">MC Profile</h2>
                <Button variant="ghost" size="icon-sm" aria-label="Close profile" onClick={() => setShowDetail(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <MCDetailPanel
                mc={selectedMC}
                isPlaying={playingId === selectedMC.id}
                onTogglePlay={() => handleTogglePlay(selectedMC.id)}
                onClose={() => setShowDetail(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating action bar for selection mode */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className={`fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 ${Z_INDEX.overlay} flex items-center gap-3 px-4 py-3 ${RADIUS.xl} bg-background border ${SHADOW["2xl"]}`}>
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Select all
          </button>
          <button
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
          <div className="h-4 w-px bg-border" />
          <Button
            size="sm"
            onClick={() => setShowRequestForm(true)}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            Submit Request
          </Button>
        </div>
      )}

      {/* Request Form Drawer */}
      {showRequestForm && (
        <>
          <div
            role="button"
            aria-label="Close request form"
            tabIndex={0}
            className={cn(`fixed inset-0 backdrop-blur-sm ${Z_INDEX.overlay} animate-fade-in`, OVERLAY.light)}
            onClick={() => setShowRequestForm(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowRequestForm(false); }}
          />
          <div data-focus-trap="request-drawer" className={`fixed right-0 top-0 bottom-0 ${WIDTH.detailPanel} bg-background lg:border-l border-border ${Z_INDEX.modal} overflow-y-auto animate-slide-in-right ${SHADOW["2xl"]}`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-sm">Request MCs</h2>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowRequestForm(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <MCRequestForm
                selectedMCs={selectedMCs}
                onClose={() => setShowRequestForm(false)}
                onSuccess={handleRequestSuccess}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`size-16 ${RADIUS.xl} bg-muted/60 border border-border/60 flex items-center justify-center mb-4`}>
        <Users className="size-6 text-muted-foreground/30" />
      </div>
      <p className="text-lg font-semibold text-muted-foreground">No MCs found</p>
      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
    </div>
  );
}
