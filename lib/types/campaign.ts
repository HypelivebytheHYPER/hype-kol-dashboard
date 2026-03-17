/**
 * Campaign Management Types
 * Unified type definitions for Campaign Management System
 * Merged from dashboard and discovery projects
 */

import type { KOLCardData } from "./kol";

/**
 * Campaign status values
 */
export type CampaignStatus = "draft" | "active" | "completed" | "archived";

/**
 * Campaign KOL status values
 */
export type CampaignKOLStatus = "pending" | "contacted" | "negotiating" | "confirmed" | "rejected";

/**
 * Campaign KOL entry
 * Links a KOL to a campaign with additional metadata
 */
export interface CampaignKOL {
  kolId: string;
  kolData: KOLCardData;
  addedAt: Date;
  notes?: string;
  status: CampaignKOLStatus;
  fee?: number;
}

/**
 * Campaign entity
 * Represents a marketing campaign for client KOL outreach
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  status: CampaignStatus;
  kols: CampaignKOL[];
  createdAt: Date;
  updatedAt: Date;
  budget?: number;
  targetReach?: number;
}

/**
 * Campaign statistics
 * Computed metrics for a campaign
 */
export interface CampaignStats {
  totalKOLs: number;
  estimatedReach: number;
  totalFee: number;
  statusBreakdown: Record<CampaignKOLStatus, number>;
  averageEngagementRate: number;
  tierBreakdown: Record<string, number>;
  totalFollowers: number;
  estimatedTotalGMV: string;
  platformBreakdown: Record<string, number>;
}

/**
 * CampaignMetrics alias for CampaignStats (for compatibility)
 */
export type CampaignMetrics = CampaignStats;

/**
 * Campaign summary (for list views)
 * Minimal campaign data for display in lists
 */
export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  clientName?: string;
  kolCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign creation payload
 */
export interface CreateCampaignPayload {
  name: string;
  description?: string;
  clientName?: string;
  budget?: number;
  targetReach?: number;
}

/**
 * Campaign update payload
 */
export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  clientName?: string;
  status?: CampaignStatus;
  budget?: number;
  targetReach?: number;
}

/**
 * Add KOL to campaign payload
 */
export interface AddKOLToCampaignPayload {
  kolData: KOLCardData;
  notes?: string;
  fee?: number;
}

/**
 * Update KOL in campaign payload
 */
export interface UpdateCampaignKOLPayload {
  status?: CampaignKOLStatus;
  notes?: string;
  fee?: number;
}

/**
 * Campaign filter options
 */
export interface CampaignFilter {
  status?: CampaignStatus[];
  searchQuery?: string;
  clientName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Campaign sort options
 */
export type CampaignSortField = "name" | "createdAt" | "updatedAt" | "kolCount";
export type CampaignSortOrder = "asc" | "desc";

export interface CampaignSort {
  field: CampaignSortField;
  order: CampaignSortOrder;
}

/**
 * Campaign API response
 */
export interface CampaignApiResponse {
  success: boolean;
  data?: Campaign | Campaign[];
  error?: string;
  message?: string;
}

/**
 * Campaign KOL status labels for display
 */
export const CampaignKOLStatusLabels: Record<CampaignKOLStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  negotiating: "Negotiating",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

/**
 * Campaign status labels for display
 */
export const CampaignStatusLabels: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

/**
 * Campaign status colors for UI
 */
export const CampaignStatusColors: Record<CampaignStatus, string> = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  completed: "bg-blue-500",
  archived: "bg-purple-500",
};

/**
 * Campaign KOL status colors for UI
 */
export const CampaignKOLStatusColors: Record<CampaignKOLStatus, string> = {
  pending: "bg-yellow-500",
  contacted: "bg-blue-500",
  negotiating: "bg-orange-500",
  confirmed: "bg-green-500",
  rejected: "bg-red-500",
};

/**
 * Campaign store state
 */
export interface CampaignStoreState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}

/**
 * Campaign store actions
 */
export interface CampaignStoreActions {
  createCampaign: (payload: CreateCampaignPayload) => Campaign;
  updateCampaign: (id: string, updates: UpdateCampaignPayload) => Campaign | null;
  deleteCampaign: (id: string) => boolean;
  addKOLToCampaign: (campaignId: string, kol: KOLCardData, notes?: string, fee?: number) => boolean;
  removeKOLFromCampaign: (campaignId: string, kolId: string) => boolean;
  setActiveCampaign: (id: string | null) => void;
  getCampaign: (id: string) => Campaign | undefined;
  getActiveCampaign: () => Campaign | null;
  getCampaignStats: (id: string) => CampaignStats | null;
}

/**
 * Campaign context type
 */
export interface CampaignContextType {
  activeCampaignId: string | null;
  setActiveCampaign: (id: string | null) => void;
  addKOLToActiveCampaign: (kol: KOLCardData) => boolean;
  removeKOLFromActiveCampaign: (kolId: string) => void;
  activeCampaign: Campaign | null;
  activeCampaignMetrics: CampaignStats | null;
  isKOLInActiveCampaign: (kolId: string) => boolean;
}

/**
 * Campaign selector props
 */
export interface CampaignSelectorProps {
  selectedCampaignId: string | null;
  onSelectCampaign: (id: string | null) => void;
  showCreateNew?: boolean;
}

/**
 * Quick add toast props
 */
export interface QuickAddToastProps {
  kolNickname: string;
  campaignName: string;
  onUndo: () => void;
  onViewCampaign: () => void;
  onDismiss: () => void;
}

/**
 * Campaign stats props
 */
export interface CampaignStatsProps {
  campaign: Campaign | null;
  metrics: CampaignStats | null;
}

/**
 * Campaign with metrics
 */
export interface CampaignWithMetrics extends Campaign {
  metrics: CampaignStats;
}

/**
 * Content type for export
 */
export type ExportContentType = "Live" | "Video" | "Both";

/**
 * Export-safe KOL data
 */
export interface ExportSafeKOL {
  id: string;
  nickname: string;
  handle: string;
  platform: string;
  category?: string;
  tier: string;
  followers: number;
  engagementRate: number;
  avgMonthlyGMV: number;
  qualityScore: number;
  contentType: ExportContentType;
}

/**
 * Export format options
 */
export type ExportFormat = "csv" | "pdf";

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeMetrics?: boolean;
  includePlatformBreakdown?: boolean;
  includeTierBreakdown?: boolean;
  agencyName?: string;
  clientName?: string;
}

/**
 * Proposal statistics
 */
export interface ProposalStats {
  totalKOLs: number;
  totalFollowers: number;
  avgEngagementRate: number;
  avgQualityScore: number;
  totalAvgMonthlyGMV: number;
  platformBreakdown: Record<string, number>;
  tierBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}
