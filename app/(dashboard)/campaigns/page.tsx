"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  Users,
  TrendingUp,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KOLAvatar } from "@/components/ui/premium-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from "@/hooks/use-campaigns";
import { useKOLs } from "@/hooks";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getCampaignStatus, COLLECTION_PRESETS } from "@/lib/config/campaigns";
import { toast } from "sonner";
import type { ApiKOL } from "@/lib/lark-api";

const ITEMS_PER_PAGE = 6;

const PRESET_CONFIGS = COLLECTION_PRESETS.map((preset) => ({
  ...preset,
  filter: preset.filter as (kols: ApiKOL[]) => ApiKOL[],
}));

export default function CampaignsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: campaignsData, isLoading } = useCampaigns();
  const { data: kolsData } = useKOLs();
  const createCampaign = useCreateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const allKOLs = kolsData?.data || [];
  const campaigns = campaignsData?.data || [];

  // Build KOL lookup map for avatar resolution
  const kolMap = useMemo(() => {
    const m = new Map<string, ApiKOL>();
    for (const k of allKOLs) m.set(k.id, k);
    return m;
  }, [allKOLs]);

  // Preset preview KOLs
  const presetPreviews = useMemo(() => {
    if (!allKOLs.length) return {} as Record<string, ApiKOL[]>;
    return PRESET_CONFIGS.reduce(
      (acc, p) => {
        acc[p.id] = p.filter(allKOLs).slice(0, 4);
        return acc;
      },
      {} as Record<string, ApiKOL[]>
    );
  }, [allKOLs]);

  const filtered = useMemo(() => {
    let result = campaigns;
    if (searchQuery.trim()) {
      result = result.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [campaigns, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalKOLs = campaigns.reduce((s, c) => s + (c.assignedKOLs?.length || 0), 0);
    const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
    return { total: campaigns.length, totalKOLs, totalBudget };
  }, [campaigns]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCampaign.mutateAsync({
        name: newName,
        status: "planning",
        startDate: new Date().toISOString().split("T")[0],
        assignedKOLs: [],
      });
      toast.success(`"${newName}" created`);
      setNewName("");
      setCreateDialogOpen(false);
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteCampaign.mutateAsync(id);
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handlePresetClick = (presetId: string) => {
    if (activePreset === presetId) {
      setActivePreset(null);
      router.push("/kols");
    } else {
      setActivePreset(presetId);
      router.push(`/kols?preset=${presetId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organise KOL shortlists into campaigns and launch smart collections
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <Stat label="Campaigns" value={formatNumber(stats.total)} />
          <Stat label="KOLs Assigned" value={formatNumber(stats.totalKOLs)} />
          <Stat label="Total Budget" value={formatCurrency(stats.totalBudget)} />
        </div>
      </div>

      {/* ── SMART COLLECTIONS ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Smart Collections
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_CONFIGS.map((preset, i) => {
            const previews = presetPreviews[preset.id] || [];
            return (
              <motion.button
                key={preset.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handlePresetClick(preset.id)}
                className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:shadow-lg hover:border-border ${
                  activePreset === preset.id ? "border-primary shadow-md" : "border-border/50"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`}
                />
                <div className="relative p-4">
                  <preset.icon className="w-6 h-6" />
                  <p className="mt-2 text-sm font-semibold leading-tight">{preset.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {preset.description}
                  </p>
                  {previews.length > 0 && (
                    <div className="mt-3 flex -space-x-1.5">
                      {previews.map((kol) => (
                        <KOLAvatar
                          key={kol.id}
                          kol={kol}
                          size="xs"
                          className="border-2 border-background"
                        />
                      ))}
                      <span className="ml-2 text-[10px] text-muted-foreground self-center">
                        {previews.length}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
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
        <Button
          size="sm"
          className="h-10 rounded-xl gap-1.5"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </Button>
      </div>

      {/* ── COUNT ── */}
      <p className="text-sm text-muted-foreground -mt-2">
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
          </span>
        ) : (
          <>
            <span className="font-mono font-bold text-foreground">{filtered.length}</span> campaigns
          </>
        )}
      </p>

      {/* ── CAMPAIGN GRID ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/60">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery ? "No campaigns match your search" : "No campaigns yet"}
          </p>
          {!searchQuery && (
            <Button variant="ghost" className="mt-3" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first campaign
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x md:snap-none scroll-smooth scrollbar-hide gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
            {filtered.map((campaign, index) => {
              const assignedKOLs = (campaign.assignedKOLs || [])
                .map((id) => kolMap.get(id))
                .filter((k): k is ApiKOL => !!k);
              const status = getCampaignStatus(campaign.status);
              const totalReach = assignedKOLs.reduce((s, k) => s + k.followers, 0);
              const totalRevenue = assignedKOLs.reduce((s, k) => s + (k.stats?.revenue || 0), 0);

              return (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.12) }}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-border hover:shadow-xl transition-all duration-300 cursor-pointer flex-shrink-0 snap-start w-[78vw] sm:w-[46vw] md:w-full"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  {/* ── Banner ── */}
                  <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-muted overflow-hidden">
                    {/* KOL avatar strip */}
                    {assignedKOLs.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                        {assignedKOLs.slice(0, 6).map((kol, i) => (
                          <motion.div
                            key={kol.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className="shrink-0"
                          >
                            <KOLAvatar
                              kol={kol}
                              size={i === 0 ? "lg" : i < 3 ? "md" : "sm"}
                              className="border-2 border-background shadow-md"
                            />
                          </motion.div>
                        ))}
                        {assignedKOLs.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            +{assignedKOLs.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                    {assignedKOLs.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="w-10 h-10 text-muted-foreground opacity-30" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
                    {/* Status + menu */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bgColor} ${status.color}`}
                      >
                        {status.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 bg-background/80 hover:bg-background"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleDelete(e, campaign.id, campaign.name)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Details ── */}
                  <div className="flex flex-col flex-1 justify-between px-4 py-3 gap-2.5">
                    <div>
                      <p className="font-bold text-[15px] leading-tight truncate">
                        {campaign.name}
                      </p>
                      {campaign.brand && (
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                          {campaign.brand}
                        </p>
                      )}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 divide-x divide-border/50 rounded-xl bg-muted/30 py-2">
                      <MetricCol label="KOLs" value={String(assignedKOLs.length)} />
                      <MetricCol label="Reach" value={formatNumber(totalReach)} highlight />
                      <MetricCol label="Revenue" value={formatCurrency(totalRevenue)} />
                    </div>

                    {/* Action row */}
                    <div className="flex items-center justify-between pt-0.5">
                      {campaign.startDate && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(campaign.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-auto" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
      {/* Mobile swipe hint */}
      {filtered.length > 1 && (
        <p className="flex md:hidden items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <span>←</span> swipe to browse <span>→</span>
        </p>
      )}

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>Create a campaign to organise your KOL shortlists</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Campaign Name</label>
            <Input
              placeholder="e.g., Q3 Beauty Launch"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createCampaign.isPending}>
              {createCampaign.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="text-base sm:text-lg font-mono font-bold leading-tight truncate">{value}</p>
    </div>
  );
}

function MetricCol({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center px-1 sm:px-2 min-w-0 py-1">
      <p
        className={`text-[12px] sm:text-[13px] font-mono font-bold leading-tight truncate tabular-nums ${highlight ? "text-foreground" : "text-foreground opacity-80"}`}
      >
        {value}
      </p>
      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{label}</p>
    </div>
  );
}
