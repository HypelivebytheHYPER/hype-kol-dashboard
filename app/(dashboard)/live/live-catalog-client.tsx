"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, X, Users, LayoutGrid, List, Map as MapIcon, CheckSquare, Square, ArrowUpDown, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, getBrandsInCategory, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES } from "@/lib/design-tokens";
import { MCCard } from "./mc-card";
import { MCListItem } from "./mc-list-item";
import { MCDetailPanel } from "./mc-detail-panel";
import { WireMap } from "./wire-map";
import { MCRequestForm } from "./mc-request-form";
import type { LiveMC } from "@/lib/types/catalog";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
}

type ViewMode = "list" | "grid" | "wiremap";
type SortMode = "default" | "name-asc" | "name-desc";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getLetter(handle: string): string {
  const first = handle.trim().charAt(0).toUpperCase();
  return ALPHABET.includes(first) ? first : "#";
}

export function LiveCatalogClient({ mcs }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const [showDetail, setShowDetail] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef(new Map<string, HTMLDivElement>());

  const activeCategories = useMemo(() => {
    const catSet = new Set<ContentCategoryId>();
    mcs.forEach((mc) => mc.contentCategories.forEach((c) => catSet.add(c as ContentCategoryId)));
    return CONTENT_CATEGORIES.filter((c) => catSet.has(c.id));
  }, [mcs]);

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
      .slice(0, 16)
      .map(([name]) => name);
  }, [mcs, selectedCategory]);

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
    if (sortMode === "name-asc") {
      result = [...result].sort((a, b) => a.handle.localeCompare(b.handle, "th", { sensitivity: "base" }));
    } else if (sortMode === "name-desc") {
      result = [...result].sort((a, b) => b.handle.localeCompare(a.handle, "th", { sensitivity: "base" }));
    }
    return result;
  }, [mcs, selectedCategory, selectedBrand, searchQuery, sortMode]);

  /* ── Alphabetical groups ── */
  const letterGroups = useMemo(() => {
    const groups = new Map<string, LiveMC[]>();
    filtered.forEach((mc) => {
      const letter = getLetter(mc.handle);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter)!.push(mc);
    });
    return groups;
  }, [filtered]);

  const availableLetters = useMemo(() => {
    return ALPHABET.filter((l) => letterGroups.has(l));
  }, [letterGroups]);

  /* ── Scroll spy for active letter ── */
  useEffect(() => {
    if (view !== "list" || availableLetters.length === 0) return;
    const container = listRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const letter = entry.target.getAttribute("data-letter");
            if (letter) setActiveLetter(letter);
          }
        });
      },
      { root: container, threshold: 0.1 }
    );

    letterRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view, availableLetters, filtered]);

  /* ── Jump to letter ── */
  const scrollToLetter = useCallback((letter: string) => {
    const el = letterRefs.current.get(letter);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const selectedMC = useMemo(() => {
    return filtered.find((mc) => mc.id === selectedId) ?? filtered[0] ?? null;
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
      prevFilteredRef.current = filtered;
      const stillValid = filtered.some((mc) => mc.id === selectedId);
      if (!stillValid && filtered.length > 0) {
        setSelectedId(filtered[0].id);
      }
    }
  }, [filtered, selectedId]);

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

  const handleSelect = useCallback((mcId: string) => {
    setSelectedId(mcId);
    setShowDetail(true);
  }, []);

  const handleToggleCheck = useCallback((mcId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mcId)) next.delete(mcId);
      else next.add(mcId);
      return next;
    });
  }, []);

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
      if (prev === "name-asc") return "name-desc";
      return "name-asc";
    });
  };

  // Close detail on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowDetail(false);
        setShowRequestForm(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live MC Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mcs.length} MCs · {totalBrands} brands · {totalCategories} categories
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
          <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border/40">
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("wiremap")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === "wiremap" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
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
            {sortMode === "name-asc" ? "A → Z" : "Z → A"}
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
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
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
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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
          <span className="font-mono font-bold text-foreground">{filtered.length}</span> talent
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
          "flex-1 min-w-0 transition-all duration-300",
          showDetail ? "hidden lg:block" : "block"
        )}>
          {view === "wiremap" ? (
            <WireMap mcs={filtered} selectedCategory={selectedCategory} />
          ) : view === "grid" ? (
            <>
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
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
                </div>
              ) : (
                <EmptyState />
              )}
            </>
          ) : (
            /* ── List View: Alphabetical Directory ── */
            <div className="relative flex gap-6">
              {/* Main list */}
              <div ref={listRef} className="flex-1 min-w-0 flex flex-col">
                {filtered.length > 0 ? (
                  Array.from(letterGroups.entries()).map(([letter, groupMCs]) => (
                    <section key={letter} className="flex flex-col">
                      {/* Sticky letter header */}
                      <div
                        ref={(el) => {
                          if (el) letterRefs.current.set(letter, el);
                        }}
                        data-letter={letter}
                        className="sticky top-0 z-10 flex items-center gap-4 py-2 bg-background/95 backdrop-blur-sm"
                      >
                        <span className="text-4xl font-black tracking-tighter text-muted-foreground/40 select-none">
                          {letter}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {groupMCs.length}
                        </span>
                      </div>

                      {/* MCs in this letter group */}
                      <div className="flex flex-col divide-y divide-border/30">
                        {groupMCs.map((mc, idx) => (
                          <MCListItem
                            key={mc.id}
                            mc={mc}
                            isSelected={selectedMC?.id === mc.id}
                            isPlaying={playingId === mc.id}
                            hasVideo={mc.videos.length > 0}
                            isSelectionMode={isSelectionMode}
                            isChecked={selectedIds.has(mc.id)}
                            onSelect={() => handleSelect(mc.id)}
                            onPlay={() => handlePlay(mc.id)}
                            onToggleCheck={() => handleToggleCheck(mc.id)}
                            index={idx}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* Alphabet jump sidebar — desktop only */}
              {!showDetail && availableLetters.length > 0 && (
                <div className="hidden lg:flex flex-col items-center gap-0.5 shrink-0 w-8 sticky top-4 h-fit">
                  {ALPHABET.map((letter) => {
                    const hasItems = letterGroups.has(letter);
                    const isActive = activeLetter === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => hasItems && scrollToLetter(letter)}
                        disabled={!hasItems}
                        className={cn(
                          "w-7 h-7 rounded-md text-[11px] font-bold transition-all flex items-center justify-center",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm scale-110"
                            : hasItems
                              ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                              : "text-muted-foreground/20 cursor-default"
                        )}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inline Detail Panel */}
        <div className={cn(
          "shrink-0 border-l border-border bg-background overflow-y-auto transition-all duration-300 ease-out",
          showDetail ? "w-full lg:w-[480px]" : "w-0"
        )}>
          {showDetail && selectedMC && (
            <div className="p-4 sm:p-6 min-w-[320px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">MC Profile</h2>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowDetail(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <MCDetailPanel
                mc={selectedMC}
                isPlaying={playingId === selectedMC.id}
                onTogglePlay={() => handlePlay(selectedMC.id)}
                onClose={() => setShowDetail(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating action bar for selection mode */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-background border shadow-2xl">
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
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowRequestForm(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowRequestForm(false); }}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] lg:w-[480px] bg-background border-l border-border z-50 overflow-y-auto animate-slide-in-right shadow-2xl">
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
      <div className="size-16 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-4">
        <Users className="size-6 text-muted-foreground/30" />
      </div>
      <p className="text-lg font-semibold text-muted-foreground">No MCs found</p>
      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
    </div>
  );
}
