"use client";

import { useState } from "react";
import { CardStack } from "@/components/discovery/card-stack";
import { FilterPanel } from "@/components/discovery/filter-panel";
import { useDiscoveryStore } from "@/lib/store/discovery-store";
import type { KOLCardData } from "@/lib/types/kol";
import { apiKOLToCardData } from "@/hooks/use-kol-display";
import type { Creator } from "@/lib/lark-api";

interface DiscoverClientProps {
  initialKOLs: Creator[];
}

export function DiscoverClient({ initialKOLs }: DiscoverClientProps) {
  const [kols] = useState<KOLCardData[]>(() =>
    initialKOLs?.map(apiKOLToCardData) || []
  );

  // Discovery store - use individual selectors to avoid infinite re-renders
  const totalSwiped = useDiscoveryStore(
    (state) => state.likedKOLs.length + state.passedKOLIds.length + state.superLikedKOLs.length
  );
  const totalLiked = useDiscoveryStore((state) => state.likedKOLs.length);
  const totalSuperLiked = useDiscoveryStore((state) => state.superLikedKOLs.length);
  const totalPassed = useDiscoveryStore((state) => state.passedKOLIds.length);

  const handleLoadMore = async () => {
    return []; // All KOLs already loaded from server
  };

  return (
    <div data-testid="discover-page" className="min-h-[calc(100vh-8rem)]">
      <div className="py-4 sm:py-6">
        {/* Header */}
        <header className="mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Discover Creators</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Swipe through profiles and find the perfect creator for your brand
            </p>
          </div>
        </header>

        {kols.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No creators available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main discovery area */}
            <div className="lg:col-span-2">
              <CardStack
                initialKols={kols}
                onLoadMore={handleLoadMore}
              />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="sticky top-8 space-y-6">
                {/* Filter Panel */}
                <div className="bg-card rounded-xl border border-border/40 p-6">
                  <h2 className="text-base font-semibold mb-4">Filters</h2>
                  <FilterPanel />
                </div>

                {/* Discovery Stats */}
                <div className="bg-muted/40 rounded-xl border border-border/40 p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4">Your Stats</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Total Swiped</span>
                      <span className="font-bold text-foreground text-lg">{totalSwiped}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Liked</span>
                      <span
                        data-testid="stats-liked"
                        className="font-bold text-emerald-500 text-lg"
                      >
                        {totalLiked}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Super Liked</span>
                      <span className="font-bold text-blue-500 text-lg">{totalSuperLiked}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground text-sm">Passed</span>
                      <span
                        data-testid="stats-passed"
                        className="font-bold text-destructive text-lg"
                      >
                        {totalPassed}
                      </span>
                    </div>

                    {totalSwiped > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="text-sm text-muted-foreground mb-2">Like Rate</div>
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((totalLiked / totalSwiped) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
