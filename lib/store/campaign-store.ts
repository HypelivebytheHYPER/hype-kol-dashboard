/**
 * Campaign Store - Zustand
 * Manages campaigns with persistence to localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Campaign,
  CampaignKOL,
  CampaignStats,
  CampaignStatus,
  CampaignKOLStatus,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  UpdateCampaignKOLPayload,
} from "../types/campaign";
import type { KOLCardData } from "../types/kol";
import { formatNumber } from "../utils";

interface CampaignState {
  // Collections
  campaigns: Campaign[];
  activeCampaignId: string | null;

  // Actions - Campaign Management
  createCampaign: (payload: CreateCampaignPayload) => Campaign;
  deleteCampaign: (campaignId: string) => boolean;
  updateCampaign: (campaignId: string, payload: UpdateCampaignPayload) => Campaign | null;
  setActiveCampaign: (id: string | null) => void;

  // Actions - KOL Management
  addKOLToCampaign: (campaignId: string, kol: KOLCardData, notes?: string, fee?: number) => boolean;
  removeKOLFromCampaign: (campaignId: string, kolId: string) => boolean;
  updateKOLInCampaign: (
    campaignId: string,
    kolId: string,
    payload: UpdateCampaignKOLPayload
  ) => boolean;

  // Actions - Bulk Operations
  addKOLToMultipleCampaigns: (
    campaignIds: string[],
    kol: KOLCardData
  ) => { success: string[]; failed: string[] };

  // Queries
  getCampaign: (campaignId: string) => Campaign | undefined;
  getCampaignsByStatus: (status: CampaignStatus) => Campaign[];
  getCampaignStats: (campaignId: string) => CampaignStats | null;
  getKOLCampaigns: (kolId: string) => Campaign[];
  isKOLInCampaign: (campaignId: string, kolId: string) => boolean;

  // Utilities
  searchCampaigns: (query: string) => Campaign[];
  clearAll: () => void;
}

function generateId(): string {
  return `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      activeCampaignId: null,

      // Create a new campaign
      createCampaign: (payload) => {
        const now = new Date();
        const newCampaign: Campaign = {
          id: generateId(),
          name: payload.name,
          description: payload.description,
          clientName: payload.clientName,
          status: "draft",
          kols: [],
          createdAt: now,
          updatedAt: now,
          budget: payload.budget,
          targetReach: payload.targetReach,
        };

        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
        }));

        return newCampaign;
      },

      // Delete a campaign
      deleteCampaign: (campaignId) => {
        const campaign = get().campaigns.find((c) => c.id === campaignId);
        if (!campaign) return false;

        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== campaignId),
        }));

        return true;
      },

      // Update campaign details
      updateCampaign: (campaignId, payload) => {
        let updatedCampaign: Campaign | null = null;

        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              updatedCampaign = {
                ...c,
                ...(payload.name !== undefined && { name: payload.name }),
                ...(payload.description !== undefined && { description: payload.description }),
                ...(payload.clientName !== undefined && { clientName: payload.clientName }),
                ...(payload.status !== undefined && { status: payload.status }),
                ...(payload.budget !== undefined && { budget: payload.budget }),
                ...(payload.targetReach !== undefined && { targetReach: payload.targetReach }),
                updatedAt: new Date(),
              };
              return updatedCampaign;
            }
            return c;
          }),
        }));

        return updatedCampaign;
      },

      // Set active campaign
      setActiveCampaign: (id) => {
        set({ activeCampaignId: id });
      },

      // Add KOL to campaign
      addKOLToCampaign: (campaignId, kol, notes, fee) => {
        const state = get();
        const campaign = state.campaigns.find((c) => c.id === campaignId);
        if (!campaign) return false;

        // Check if KOL already exists in campaign
        if (campaign.kols.some((k) => k.kolId === kol.id)) {
          return false;
        }

        const newCampaignKOL: CampaignKOL = {
          kolId: kol.id,
          kolData: kol,
          addedAt: new Date(),
          notes,
          status: "pending",
          fee,
        };

        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              return {
                ...c,
                kols: [...c.kols, newCampaignKOL],
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));

        return true;
      },

      // Remove KOL from campaign
      removeKOLFromCampaign: (campaignId, kolId) => {
        const state = get();
        const campaign = state.campaigns.find((c) => c.id === campaignId);
        if (!campaign) return false;

        if (!campaign.kols.some((k) => k.kolId === kolId)) {
          return false;
        }

        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              return {
                ...c,
                kols: c.kols.filter((k) => k.kolId !== kolId),
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));

        return true;
      },

      // Update KOL in campaign
      updateKOLInCampaign: (campaignId, kolId, payload) => {
        let success = false;

        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === campaignId) {
              const kolExists = c.kols.some((k) => k.kolId === kolId);
              if (!kolExists) return c;

              success = true;
              return {
                ...c,
                kols: c.kols.map((k) => {
                  if (k.kolId === kolId) {
                    return {
                      ...k,
                      ...(payload.status !== undefined && { status: payload.status }),
                      ...(payload.notes !== undefined && { notes: payload.notes }),
                      ...(payload.fee !== undefined && { fee: payload.fee }),
                    };
                  }
                  return k;
                }),
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));

        return success;
      },

      // Add KOL to multiple campaigns
      addKOLToMultipleCampaigns: (campaignIds, kol) => {
        const success: string[] = [];
        const failed: string[] = [];

        campaignIds.forEach((campaignId) => {
          const result = get().addKOLToCampaign(campaignId, kol);
          if (result) {
            success.push(campaignId);
          } else {
            failed.push(campaignId);
          }
        });

        return { success, failed };
      },

      // Get single campaign
      getCampaign: (campaignId) => {
        return get().campaigns.find((c) => c.id === campaignId);
      },

      // Get campaigns by status
      getCampaignsByStatus: (status) => {
        return get().campaigns.filter((c) => c.status === status);
      },

      // Get campaign statistics
      getCampaignStats: (campaignId) => {
        const campaign = get().campaigns.find((c) => c.id === campaignId);
        if (!campaign) return null;

        const totalKOLs = campaign.kols.length;
        const estimatedReach = campaign.kols.reduce((sum, k) => sum + k.kolData.followers, 0);
        const totalFee = campaign.kols.reduce((sum, k) => sum + (k.fee || 0), 0);
        const averageEngagementRate =
          totalKOLs > 0
            ? campaign.kols.reduce((sum, k) => sum + k.kolData.engagementRate, 0) / totalKOLs
            : 0;

        const statusBreakdown: Record<CampaignKOLStatus, number> = {
          pending: 0,
          contacted: 0,
          negotiating: 0,
          confirmed: 0,
          rejected: 0,
        };

        const tierBreakdown: Record<string, number> = {};
        const platformBreakdown: Record<string, number> = {};
        let totalFollowers = 0;
        let totalGMV = 0;

        campaign.kols.forEach((k) => {
          statusBreakdown[k.status]++;
          tierBreakdown[k.kolData.tier] = (tierBreakdown[k.kolData.tier] || 0) + 1;
          platformBreakdown[k.kolData.platform] = (platformBreakdown[k.kolData.platform] || 0) + 1;
          totalFollowers += k.kolData.followers;
          totalGMV += k.kolData.avgMonthlyGMV || 0;
        });

        return {
          totalKOLs,
          estimatedReach,
          totalFee,
          statusBreakdown,
          averageEngagementRate,
          tierBreakdown,
          totalFollowers,
          estimatedTotalGMV: formatNumber(totalGMV),
          platformBreakdown,
        };
      },

      // Get all campaigns containing a specific KOL
      getKOLCampaigns: (kolId) => {
        return get().campaigns.filter((c) => c.kols.some((k) => k.kolId === kolId));
      },

      // Check if KOL is in campaign
      isKOLInCampaign: (campaignId, kolId) => {
        const campaign = get().campaigns.find((c) => c.id === campaignId);
        if (!campaign) return false;
        return campaign.kols.some((k) => k.kolId === kolId);
      },

      // Search campaigns by name, client, or description
      searchCampaigns: (query) => {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return get().campaigns;

        return get().campaigns.filter(
          (c) =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.clientName?.toLowerCase().includes(lowerQuery) ?? false) ||
            (c.description?.toLowerCase().includes(lowerQuery) ?? false)
        );
      },

      // Clear all campaigns
      clearAll: () => set({ campaigns: [] }),
    }),
    {
      name: "kol-campaign-store",
      partialize: (state) => ({
        campaigns: state.campaigns,
        activeCampaignId: state.activeCampaignId,
      }),
    }
  )
);
