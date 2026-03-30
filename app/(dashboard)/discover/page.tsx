/**
 * KOL Discovery Page
 * Main Tinder-style card discovery interface
 * Integrated with Campaign Management system
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { CardStack } from "@/components/discovery/card-stack";
import { FilterPanel } from "@/components/discovery/filter-panel";
import { CampaignSelector } from "@/components/discovery/campaign-selector";
import { CampaignStats } from "@/components/discovery/campaign-stats";
import { QuickAddToastContainer, useQuickAddToast } from "@/components/discovery/quick-add-toast";
import { useDiscoveryStore } from "@/lib/store/discovery-store";
import { useCampaignStore } from "@/lib/store/campaign-store";
import type { KOLCardData } from "@/lib/types/kol";
import { larkApi } from "@/lib/lark-api";
import { apiKOLToCardData } from "@/hooks/use-kol-display";

function DiscoveryLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] rounded-2xl bg-muted/30">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Loading KOLs...</p>
      </div>
    </div>
  );
}

function DiscoveryContent() {
  const router = useRouter();
  const [kols, setKols] = useState<KOLCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Discovery store - use individual selectors to avoid infinite re-renders
  const totalSwiped = useDiscoveryStore(
    (state) => state.likedKOLs.length + state.passedKOLIds.length + state.superLikedKOLs.length
  );
  const totalLiked = useDiscoveryStore((state) => state.likedKOLs.length);
  const totalSuperLiked = useDiscoveryStore((state) => state.superLikedKOLs.length);
  const totalPassed = useDiscoveryStore((state) => state.passedKOLIds.length);
  const autoAddToCampaign = useDiscoveryStore((state) => state.autoAddToCampaign);

  // Campaign store
  const [activeCampaignId, setActiveCampaign] = useState<string | null>(null);
  const campaigns = useCampaignStore((state) => state.campaigns);
  const addKOLToCampaign = useCampaignStore((state) => state.addKOLToCampaign);
  const removeKOLFromCampaign = useCampaignStore((state) => state.removeKOLFromCampaign);
  const getCampaignStats = useCampaignStore((state) => state.getCampaignStats);

  // Toast notifications
  const { toasts, addToast, removeToast } = useQuickAddToast();

  // Get active campaign and metrics
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || null;
  const activeCampaignMetrics = activeCampaignId ? getCampaignStats(activeCampaignId) : null;

  // Fetch initial KOLs
  useEffect(() => {
    const fetchKOLs = async () => {
      try {
        setIsLoading(true);
        const data = await larkApi.getKOLs({ pageSize: 50 });
        setKols(data.data?.map(apiKOLToCardData) || []);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load KOLs");
        setKols([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKOLs();
  }, []);

  const handleLoadMore = async () => {
    try {
      const data = await larkApi.getKOLs({ pageSize: 50 });
      return data.data?.map(apiKOLToCardData) || [];
    } catch (_err) {
      return [];
    }
  };

  // Handle KOL liked - add to campaign if active
  const handleKOLLiked = useCallback(
    (kol: KOLCardData) => {
      if (autoAddToCampaign && activeCampaignId) {
        const campaign = campaigns.find((c) => c.id === activeCampaignId);

        if (campaign && !campaign.kols.some((k) => k.kolId === kol.id)) {
          // Pass KOLCardData directly to campaign
          addKOLToCampaign(activeCampaignId, kol);

          // Show toast notification
          addToast({
            kolNickname: kol.nickname,
            campaignName: campaign.name,
            onUndo: () => {
              removeKOLFromCampaign(activeCampaignId, kol.id);
            },
            onViewCampaign: () => {
              router.push(`/campaigns/${activeCampaignId}`);
            },
            onDismiss: () => {},
          });
        }
      }
    },
    [
      activeCampaignId,
      autoAddToCampaign,
      campaigns,
      addKOLToCampaign,
      removeKOLFromCampaign,
      addToast,
      router,
    ]
  );

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-2xl bg-muted/30">
        <div className="bg-card rounded-xl border border-border/40 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Error Loading KOLs</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="discover-page" className="min-h-[calc(100vh-8rem)]">
      <div className="py-4 sm:py-6">
        {/* Header with Campaign Selector */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Discover KOLs</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Swipe through profiles and find the perfect KOL for your brand
              </p>
            </div>

            {/* Campaign Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Active Campaign:
              </span>
              <CampaignSelector
                selectedCampaignId={activeCampaignId}
                onSelectCampaign={setActiveCampaign}
                showCreateNew={true}
              />
            </div>
          </div>

          {/* Active Campaign Indicator */}
          {activeCampaign && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Swipe right to add KOLs to &quot;{activeCampaign.name}&quot;
              </span>
            </div>
          )}
        </header>

        {isLoading ? (
          <DiscoveryLoading />
        ) : kols.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No KOLs available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main discovery area */}
            <div className="lg:col-span-2">
              <CardStack
                initialKols={kols}
                onLoadMore={handleLoadMore}
                onKOLLiked={handleKOLLiked}
              />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Campaign Stats */}
              <div className="sticky top-8 space-y-6">
                <CampaignStats campaign={activeCampaign} metrics={activeCampaignMetrics} />

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

      {/* Toast Notifications */}
      <QuickAddToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoveryLoading />}>
      <DiscoveryContent />
    </Suspense>
  );
}
