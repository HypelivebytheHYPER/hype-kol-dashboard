"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Building2,
  Tag,
  Banknote,
  ExternalLink,
  ImageIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { useOOHMedia } from "@/hooks/use-kols";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ApiOOHMedia } from "@/lib/lark-api";

const ITEMS_PER_PAGE = 12;

type ViewMode = "grid" | "list";
type SortKey = "monthlyRate" | "totalRate" | "name" | "vendor";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "monthlyRate", label: "Monthly Rate" },
  { key: "totalRate", label: "Total Rate" },
  { key: "name", label: "Name" },
  { key: "vendor", label: "Vendor" },
];

function getSortValue(media: ApiOOHMedia, key: SortKey): number | string {
  switch (key) {
    case "monthlyRate":
      return media.monthlyRate || 0;
    case "totalRate":
      return media.totalRate || 0;
    case "name":
      return media.mediaName;
    case "vendor":
      return media.vendor;
  }
}

export default function OOHPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("monthlyRate");
  const [sortDesc, setSortDesc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const { data: oohData, isLoading } = useOOHMedia();
  const media = oohData?.data || [];

  // Extract unique filter options
  const { categories, vendors, locations } = useMemo(() => {
    const catSet = new Set<string>();
    const vendSet = new Set<string>();
    const locSet = new Set<string>();

    media.forEach((m) => {
      if (m.category) catSet.add(m.category);
      if (m.vendor) vendSet.add(m.vendor);
      m.locationCoverage?.forEach((loc) => loc && locSet.add(loc));
    });

    return {
      categories: Array.from(catSet).sort(),
      vendors: Array.from(vendSet).sort(),
      locations: Array.from(locSet).sort(),
    };
  }, [media]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = media;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.mediaName?.toLowerCase().includes(q) ||
          m.vendor?.toLowerCase().includes(q) ||
          m.category?.toLowerCase().includes(q) ||
          m.specifications?.toLowerCase().includes(q) ||
          m.subcategory?.some((s) => s?.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((m) => selectedCategories.includes(m.category));
    }

    // Vendor filter
    if (selectedVendors.length > 0) {
      result = result.filter((m) => selectedVendors.includes(m.vendor));
    }

    // Location filter
    if (selectedLocations.length > 0) {
      result = result.filter((m) =>
        m.locationCoverage?.some((loc) => selectedLocations.includes(loc))
      );
    }

    return result;
  }, [media, searchQuery, selectedCategories, selectedVendors, selectedLocations]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = getSortValue(a, sortBy);
      const vb = getSortValue(b, sortBy);
      if (typeof va === "string" && typeof vb === "string") {
        return sortDesc ? vb.localeCompare(va) : va.localeCompare(vb);
      }
      return sortDesc ? (vb as number) - (va as number) : (va as number) - (vb as number);
    });
  }, [filtered, sortBy, sortDesc]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const total = filtered.length;
    const avgMonthlyRate =
      total > 0 ? filtered.reduce((s, m) => s + (m.monthlyRate || 0), 0) / total : 0;
    const totalProductionCost = filtered.reduce((s, m) => s + (m.productionCost || 0), 0);
    return { total, avgMonthlyRate, totalProductionCost };
  }, [filtered]);

  const toggleFilter = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
      setCurrentPage(1);
    },
    []
  );

  const activeFilterCount =
    selectedCategories.length + selectedVendors.length + selectedLocations.length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedVendors([]);
    setSelectedLocations([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OOH Media Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and filter outdoor advertising media inventory
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <Stat label="Total Media" value={formatNumber(oohData?.total || 0)} />
          <Stat label="Filtered" value={formatNumber(stats.total)} />
          <Stat
            label="Avg Rate"
            value={stats.avgMonthlyRate > 0 ? formatCurrency(stats.avgMonthlyRate) : "-"}
          />
        </div>
      </div>

      {/* === TOOLBAR === */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, vendor, category, specs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
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

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="text-xs px-3">
                <LayoutGrid className="w-3.5 h-3.5" />
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-3">
                <List className="w-3.5 h-3.5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-xl border border-dashed border-border p-3 sm:p-4 bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FilterGroup
                label="Category"
                items={categories}
                selected={selectedCategories}
                onToggle={(v) => toggleFilter(setSelectedCategories, v)}
              />
              <FilterGroup
                label="Vendor"
                items={vendors}
                selected={selectedVendors}
                onToggle={(v) => toggleFilter(setSelectedVendors, v)}
              />
              <FilterGroup
                label="Location"
                items={locations}
                selected={selectedLocations}
                onToggle={(v) => toggleFilter(setSelectedLocations, v)}
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/40 gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedCategories, ...selectedVendors, ...selectedLocations].map((v) => (
                    <Badge key={v} variant="secondary" className="gap-1 text-xs rounded-full">
                      {v}
                      <button
                        onClick={() => {
                          setSelectedCategories((p) => p.filter((x) => x !== v));
                          setSelectedVendors((p) => p.filter((x) => x !== v));
                          setSelectedLocations((p) => p.filter((x) => x !== v));
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
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Skeleton className="w-3.5 h-3.5" /> Loading...
              </span>
            ) : (
              <>
                <span className="font-mono font-bold text-foreground">{filtered.length}</span>{" "}
                results
              </>
            )}
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
                    setSortDesc(opt.key !== "name" && opt.key !== "vendor");
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  sortBy === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
                {sortBy === opt.key && <span className="ml-0.5">{sortDesc ? "↓" : "↑"}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === MEDIA DISPLAY === */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scrollbar-hide gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0"
              : "space-y-3"
          }
        >
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className={viewMode === "grid" ? "h-40 w-full" : "h-20 w-full"} />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewMode}-${currentPage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={
                viewMode === "grid"
                  ? "flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scroll-smooth scrollbar-hide gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0"
                  : "space-y-3"
              }
            >
              {paginated.map((media, index) =>
                viewMode === "grid" ? (
                  <div
                    key={media.id}
                    className="flex-shrink-0 snap-start w-[78vw] sm:w-[46vw] md:w-full"
                  >
                    <OOHGridCard media={media} index={index} />
                  </div>
                ) : (
                  <OOHListCard key={media.id} media={media} index={index} />
                )
              )}
            </motion.div>
          </AnimatePresence>

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
                <Building2 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No OOH media match your filters
              </p>
              <Button variant="ghost" onClick={clearAllFilters} className="mt-3">
                Clear all filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* === Sub-components === */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="text-base sm:text-lg font-mono font-bold leading-tight truncate">{value}</p>
    </div>
  );
}

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-hide">
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
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function OOHGridCard({ media, index }: { media: ApiOOHMedia; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full overflow-hidden card-hover group">
        {/* Media placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground opacity-30" />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {media.category || "Uncategorized"}
            </Badge>
          </div>
          {media.link && (
            <a
              href={media.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2">{media.mediaName}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />
              {media.vendor}
            </p>
          </div>

          {/* Location */}
          {media.locationCoverage && media.locationCoverage.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{media.locationCoverage.join(", ")}</span>
            </div>
          )}

          {/* Specs */}
          <div className="flex flex-wrap gap-1.5">
            {media.unitType && (
              <Badge variant="outline" className="text-[10px] h-5">
                {media.unitType}
              </Badge>
            )}
            {media.quantity && (
              <Badge variant="outline" className="text-[10px] h-5">
                Qty: {media.quantity}
              </Badge>
            )}
            {media.minimumPeriod && (
              <Badge variant="outline" className="text-[10px] h-5">
                {media.minimumPeriod}
              </Badge>
            )}
          </div>

          {/* Specifications & Condition */}
          {(media.specifications || media.specialNotes) && (
            <div className="space-y-1.5 text-xs">
              {media.specifications && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Specs:</span> {media.specifications}
                </div>
              )}
              {media.specialNotes && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Condition:</span>{" "}
                  {media.specialNotes}
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="pt-2 border-t border-border/50 space-y-1">
            {media.monthlyRate > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Banknote className="w-3 h-3" />
                  Monthly
                </span>
                <span className="font-mono font-medium">{formatCurrency(media.monthlyRate)}</span>
              </div>
            )}
            {media.totalRate > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Rate</span>
                <span className="font-mono font-medium">{formatCurrency(media.totalRate)}</span>
              </div>
            )}
            {media.productionCost > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Production</span>
                <span className="font-mono text-muted-foreground">
                  {formatCurrency(media.productionCost)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OOHListCard({ media, index }: { media: ApiOOHMedia; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Media placeholder */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{media.mediaName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {media.vendor}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {media.category}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {media.locationCoverage && media.locationCoverage.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {media.locationCoverage.join(", ")}
                  </span>
                )}
                {media.unitType && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {media.unitType}
                  </span>
                )}
                {media.quantity && <span>Qty: {media.quantity}</span>}
                {media.minimumPeriod && <span>{media.minimumPeriod}</span>}
              </div>

              {/* Specs & Condition */}
              {(media.specifications || media.specialNotes) && (
                <div className="text-xs space-y-0.5">
                  {media.specifications && (
                    <div>
                      <span className="font-medium text-foreground">Specs:</span>{" "}
                      <span className="text-muted-foreground">{media.specifications}</span>
                    </div>
                  )}
                  {media.specialNotes && (
                    <div>
                      <span className="font-medium text-foreground">Condition:</span>{" "}
                      <span className="text-muted-foreground">{media.specialNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {media.monthlyRate > 0 && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Monthly:</span>{" "}
                    <span className="font-mono font-medium">
                      {formatCurrency(media.monthlyRate)}
                    </span>
                  </span>
                )}
                {media.totalRate > 0 && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Total:</span>{" "}
                    <span className="font-mono font-medium">{formatCurrency(media.totalRate)}</span>
                  </span>
                )}
                {media.productionCost > 0 && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Production:</span>{" "}
                    <span className="font-mono">{formatCurrency(media.productionCost)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {media.link && (
              <a
                href={media.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
