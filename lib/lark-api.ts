// Lark Base API Client
// This client connects to your Cloudflare Worker at lark-http-hype.hypelive.workers.dev

const LARK_API_BASE = process.env.NEXT_PUBLIC_LARK_API_URL || "https://lark-http-hype.hypelive.workers.dev";

export interface LarkResponse<T> {
  code: number;
  msg: string;
  data?: T;
}

export interface LarkRecord<T> {
  record_id: string;
  fields: T;
  created_time: string;
  updated_time: string;
}

// KOL Records from Lark Base
export interface LarkKOL {
  Name?: string;
  Handle?: string;
  Platform?: string;
  Tier?: string;
  Followers?: number;
  "Engagement Rate"?: number;
  "Avg GMV"?: number;
  "Quality Score"?: number;
  Categories?: string[];
  Location?: string;
  "Is Live Now"?: boolean;
  "Line ID"?: string;
  Phone?: string;
  Email?: string;
}

export interface LarkCampaign {
  Name?: string;
  Brand?: string;
  Status?: string;
  Budget?: number;
  "Budget Spent"?: number;
  GMV?: number;
  ROI?: number;
  "Start Date"?: string;
  "End Date"?: string;
  "Assigned KOLs"?: string[];
}

export interface LarkRateCard {
  KOL?: string;
  Year?: number;
  Service?: string;
  "Client Rate"?: number;
  "Our Cost"?: number;
}

// API Client
export const larkApi = {
  // Fetch KOLs with optional filters
  async getKOLs(filters?: {
    tier?: string;
    platform?: string;
    category?: string;
    location?: string;
    search?: string;
  }): Promise<LarkRecord<LarkKOL>[]> {
    const params = new URLSearchParams();
    if (filters?.tier) params.append("tier", filters.tier);
    if (filters?.platform) params.append("platform", filters.platform);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.search) params.append("search", filters.search);

    const response = await fetch(`${LARK_API_BASE}/api/kols?${params}`);
    const result: LarkResponse<LarkRecord<LarkKOL>[]> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || [];
  },

  // Fetch single KOL by ID
  async getKOL(id: string): Promise<LarkRecord<LarkKOL> | null> {
    const response = await fetch(`${LARK_API_BASE}/api/kols/${id}`);
    const result: LarkResponse<LarkRecord<LarkKOL>> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || null;
  },

  // Fetch live KOLs
  async getLiveKOLs(): Promise<LarkRecord<LarkKOL>[]> {
    const response = await fetch(`${LARK_API_BASE}/api/kols/live`);
    const result: LarkResponse<LarkRecord<LarkKOL>[]> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || [];
  },

  // Fetch campaigns
  async getCampaigns(): Promise<LarkRecord<LarkCampaign>[]> {
    const response = await fetch(`${LARK_API_BASE}/api/campaigns`);
    const result: LarkResponse<LarkRecord<LarkCampaign>[]> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || [];
  },

  // Fetch single campaign
  async getCampaign(id: string): Promise<LarkRecord<LarkCampaign> | null> {
    const response = await fetch(`${LARK_API_BASE}/api/campaigns/${id}`);
    const result: LarkResponse<LarkRecord<LarkCampaign>> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || null;
  },

  // Create campaign
  async createCampaign(data: Partial<LarkCampaign>): Promise<LarkRecord<LarkCampaign>> {
    const response = await fetch(`${LARK_API_BASE}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result: LarkResponse<LarkRecord<LarkCampaign>> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data!;
  },

  // Update campaign
  async updateCampaign(id: string, data: Partial<LarkCampaign>): Promise<LarkRecord<LarkCampaign>> {
    const response = await fetch(`${LARK_API_BASE}/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result: LarkResponse<LarkRecord<LarkCampaign>> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data!;
  },

  // Fetch rate cards
  async getRateCards(kolId?: string): Promise<LarkRecord<LarkRateCard>[]> {
    const params = kolId ? `?kol_id=${kolId}` : "";
    const response = await fetch(`${LARK_API_BASE}/api/rates${params}`);
    const result: LarkResponse<LarkRecord<LarkRateCard>[]> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.msg);
    }

    return result.data || [];
  },
};

// Helper to convert Lark record to app type
export function parseLarkKOL(record: LarkRecord<LarkKOL>) {
  const fields = record.fields;
  return {
    id: record.record_id,
    name: fields.Name || "",
    handle: fields.Handle || "",
    platform: (fields.Platform || "tiktok").toLowerCase(),
    tier: (fields.Tier || "micro").toLowerCase(),
    followers: fields.Followers || 0,
    engagementRate: fields["Engagement Rate"] || 0,
    avgGMV: fields["Avg GMV"] || 0,
    qualityScore: fields["Quality Score"] || 0,
    categories: fields.Categories || [],
    location: fields.Location || "",
    isLiveNow: fields["Is Live Now"] || false,
    contact: {
      lineId: fields["Line ID"],
      phone: fields.Phone,
      email: fields.Email,
      preferredMethod: "line" as const,
    },
    createdAt: record.created_time,
    updatedAt: record.updated_time,
  };
}
