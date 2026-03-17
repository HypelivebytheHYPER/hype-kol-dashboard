"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Users, TrendingUp, DollarSign, X, ExternalLink } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { useKOLs } from "@/hooks/use-kols";
import { KOLFeedCard } from "@/components/kol/kol-feed-card";
import { toast } from "sonner";
import { getCampaignStatus } from "@/lib/config/campaigns";
import { getTierBaseRate } from "@/lib/config/tiers";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: campaignData, isLoading: campaignLoading } = useCampaign(campaignId);
  const { data: kolsData } = useKOLs();
  const updateCampaign = useUpdateCampaign();

  const campaign = campaignData?.data;
  const allKOLs = kolsData?.data || [];

  const assignedKOLs = useMemo(() => {
    if (!campaign?.assignedKOLs || !allKOLs.length) return [];
    const assignedSet = new Set(campaign.assignedKOLs);
    return allKOLs.filter((kol) => assignedSet.has(kol.id));
  }, [campaign?.assignedKOLs, allKOLs]);

  const stats = useMemo(() => {
    const totalKOLs = assignedKOLs.length;
    const totalReach = assignedKOLs.reduce((sum, k) => sum + (k.followers || 0), 0);
    const estimatedBudget = assignedKOLs.reduce((sum, k) => sum + getTierBaseRate(k.tier), 0);
    return { totalKOLs, totalReach, estimatedBudget };
  }, [assignedKOLs]);

  const handleRemoveKOL = async (kolId: string) => {
    if (!campaign) return;
    setRemovingId(kolId);
    const newAssignedKOLs = campaign.assignedKOLs.filter((id) => id !== kolId);
    try {
      await updateCampaign.mutateAsync({ id: campaignId, assignedKOLs: newAssignedKOLs });
      toast.success("KOL removed from campaign");
    } catch {
      toast.error("Failed to remove KOL");
    } finally {
      setRemovingId(null);
    }
  };

  const status = getCampaignStatus(campaign?.status);

  if (campaignLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-4xl mb-4">📂</p>
        <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The campaign you&apos;re looking for doesn&apos;t exist
        </p>
        <Button onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2 min-w-0">
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => router.push("/campaigns")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Campaigns
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {campaign.name}
            </h1>
            <Badge className={`${status.bgColor} ${status.color} border-0 shrink-0`}>
              {status.label}
            </Badge>
            {campaign.brand && (
              <span className="text-muted-foreground text-sm shrink-0">{campaign.brand}</span>
            )}
          </div>
        </div>

        {/* Stats + CTA */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-4 xs:gap-5 sm:gap-6 shrink-0">
          <div className="flex items-center gap-4 xs:gap-5">
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums leading-none">
                {stats.totalKOLs}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <Users className="w-3 h-3" />
                KOLs
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums leading-none">
                {formatNumber(stats.totalReach)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" />
                Reach
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums leading-none text-emerald-500">
                {formatCurrency(stats.estimatedBudget)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <DollarSign className="w-3 h-3" />
                Est. Budget
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/kols?addTo=${campaignId}`)}
            className="gap-2 w-full xs:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add KOLs
          </Button>
        </div>
      </div>

      {/* ── KOL Grid ── */}
      {assignedKOLs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 flex flex-col items-center gap-5 text-center">
          <Users className="w-16 h-16 text-muted-foreground/50" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold">No KOLs assigned yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Go to the KOL catalog, select KOLs using the checkboxes, then use the floating
              &quot;Add to Campaign&quot; bar to assign them here.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/kols?addTo=${campaignId}`)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Browse KOL Catalog
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {assignedKOLs.length} KOL{assignedKOLs.length !== 1 ? "s" : ""} in this campaign ·{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => router.push(`/kols?addTo=${campaignId}`)}
            >
              Browse catalog to add more
            </button>
          </p>

          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scroll-smooth scrollbar-hide gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
            <AnimatePresence mode="popLayout">
              {assignedKOLs.map((kol, i) => (
                <motion.div
                  key={kol.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  className="relative group/card flex-shrink-0 snap-start w-[78vw] sm:w-[46vw] md:w-full"
                >
                  <KOLFeedCard kol={kol} index={i} />

                  {/* Remove overlay — top-right, visible on card hover */}
                  <motion.button
                    className="absolute top-2.5 right-2.5 z-30 w-9 h-9 rounded-full bg-black/75 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-40 backdrop-blur-sm"
                    onClick={() => handleRemoveKOL(kol.id)}
                    disabled={removingId === kol.id}
                    title="Remove from campaign"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {assignedKOLs.length > 1 && (
            <p className="flex md:hidden items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
              <span>←</span> swipe to browse <span>→</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
