export interface Campaign {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  budget: {
    total: number;
    spent: number;
  };
  gmv: number;
  roi: number;
  timeline: {
    start: string;
    end: string;
  };
  assignedKOLs: AssignedKOL[];
  objectives: CampaignObjective[];
  targetAudience: TargetAudience;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type CampaignStatus =
  | 'planning'
  | 'kol_selection'
  | 'contracting'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';

export interface AssignedKOL {
  kolId: string;
  kolName: string;
  kolAvatar?: string;
  status: 'assigned' | 'contracted' | 'content_creation' | 'live' | 'completed';
  deliverables: Deliverable[];
  rate: number;
  gmv: number;
}

export interface Deliverable {
  id: string;
  type: string;
  status: 'pending' | 'in_review' | 'approved' | 'published';
  dueDate?: string;
  publishedDate?: string;
  performance?: {
    views?: number;
    engagement?: number;
    gmv?: number;
  };
}

export type CampaignObjective =
  | 'brand_awareness'
  | 'direct_sales'
  | 'product_launch'
  | 'engagement'
  | 'long_term_partnership'
  | 'content_only';

export interface TargetAudience {
  demographics?: string[];
  ageGroups?: string[];
  locations?: string[];
  interests?: string[];
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
  assignees?: string[];
}

export interface CampaignCreateInput {
  name: string;
  brand: string;
  budget: number;
  timeline: {
    start: string;
    end: string;
  };
  objectives: CampaignObjective[];
  targetAudience: TargetAudience;
}

export interface CampaignStats {
  total: number;
  byStatus: Record<CampaignStatus, number>;
  totalGMV: number;
  avgROI: number;
  activeKOLs: number;
}
