"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCampaigns, useCreateCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { useSelection } from "@/lib/selection-context";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCampaignDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedKOLs?: Array<{ id: string; name: string; handle: string }>;
  preselectedCampaignId?: string;
}

export function AddToCampaignDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  preselectedKOLs,
  preselectedCampaignId,
}: AddToCampaignDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const { t } = useI18n();
  const { items, clear, setTargetCampaignId } = useSelection();
  const { data: campaignsData, isLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const campaigns = campaignsData?.data || [];
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "in_progress" || c.status === "planning"
  );

  // Auto-select campaign when opened with a preselectedCampaignId
  const open = isControlled ? controlledOpen : internalOpen;
  useEffect(() => {
    if (open && preselectedCampaignId) {
      setSelectedCampaignId(preselectedCampaignId);
    }
  }, [open, preselectedCampaignId]);

  // Determine which KOLs to use
  const kolItems = preselectedKOLs || items.map((i) => i.kol);

  const handleAddToExisting = async () => {
    if (!selectedCampaignId) return;

    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) return;

    const currentKOLs = campaign.assignedKOLs || [];
    const newKOLs = kolItems.map((k) => k.id);
    const allKOLs = [...new Set([...currentKOLs, ...newKOLs])];

    try {
      await updateCampaign.mutateAsync({
        id: selectedCampaignId,
        assignedKOLs: allKOLs,
      });
      toast.success(`${kolItems.length} KOL(s) added to "${campaign.name}"`);
      clear();
      setTargetCampaignId(null);
      setOpen(false);
      router.push(`/campaigns/${selectedCampaignId}`);
    } catch (error) {
      console.error("Failed to add KOLs:", error);
      toast.error(
        `Failed to add KOLs: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newCampaignName.trim()) return;

    const payload = {
      name: newCampaignName,
      assignedKOLs: kolItems.map((k) => k.id),
      status: "planning",
      startDate: new Date().toISOString().split("T")[0],
    };

    try {
      await createCampaign.mutateAsync(payload);
      toast.success(`Campaign "${newCampaignName}" created with ${kolItems.length} KOL(s)`);
      clear();
      setOpen(false);
      setCreateMode(false);
      setNewCampaignName("");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error(
        `Failed to create campaign: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {createMode ? "Create New Campaign" : "Add to Campaign"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <Badge variant="secondary">{kolItems.length}</Badge>
            <span className="text-sm text-muted-foreground">KOLs selected</span>
          </div>

          {createMode ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., Summer Beauty Launch 2025"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCreateMode(false)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!newCampaignName.trim() || createCampaign.isPending}
                  onClick={handleCreateAndAdd}
                >
                  {createCampaign.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Create & Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeCampaigns.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No active campaigns</p>
                  <p className="text-xs mt-1">Create a new campaign to add these KOLs</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {activeCampaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedCampaignId === campaign.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.brand}</p>
                        </div>
                        {selectedCampaignId === campaign.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{campaign.assignedKOLs?.length || 0} KOLs</span>
                        <span>·</span>
                        <span>{formatCurrency(campaign.budget)} budget</span>
                        <span>·</span>
                        <span>{formatDate(campaign.startDate)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setCreateMode(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create New Campaign
                </Button>

                {activeCampaigns.length > 0 && (
                  <Button
                    className="w-full"
                    disabled={!selectedCampaignId || updateCampaign.isPending}
                    onClick={handleAddToExisting}
                  >
                    {updateCampaign.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Add to Selected Campaign`
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
