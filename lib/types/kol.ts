export interface KOL {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  platform: Platform;
  tier: Tier;
  followers: number;
  engagementRate: number;
  avgGMV: number;
  qualityScore: number;
  categories: Category[];
  location: string;
  isLiveNow?: boolean;
  liveStats?: LiveStats;
  contact?: ContactInfo;
  audience?: AudienceDemographics;
  contentTypes: ContentType[];
  rateCard?: RateCard;
  campaignHistory?: CampaignHistory[];
  availability?: Availability;
  createdAt: string;
  updatedAt: string;
}

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'x';

export type Tier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega';

export type Category =
  | 'beauty'
  | 'tech'
  | 'fmcg'
  | 'lifestyle'
  | 'fashion'
  | 'food'
  | 'travel'
  | 'health'
  | 'parenting'
  | 'gaming'
  | 'finance'
  | 'education';

export interface LiveStats {
  currentViewers: number;
  gmv: number;
  startedAt: string;
  duration: number;
  productsSold: number;
}

export interface ContactInfo {
  lineId?: string;
  phone?: string;
  email?: string;
  preferredMethod: 'line' | 'phone' | 'email';
  responseTimeAvg?: number;
  notes?: string;
}

export interface AudienceDemographics {
  ageGroups: Record<string, number>;
  genderSplit: {
    male: number;
    female: number;
    other: number;
  };
  topLocations: Array<{ location: string; percentage: number }>;
  interests: string[];
}

export type ContentType = 'live' | 'video' | 'story' | 'static' | 'reel' | 'short';

export interface RateCard {
  year: number;
  services: RateService[];
  markupPercentage: number;
}

export interface RateService {
  id: string;
  name: string;
  description?: string;
  clientRate: number;
  ourCost: number;
  duration?: string;
  includesUsage?: boolean;
}

export interface CampaignHistory {
  id: string;
  campaignName: string;
  brand: string;
  gmv: number;
  roi: number;
  contentTypes: ContentType[];
  dateRange: {
    start: string;
    end: string;
  };
  performance: 'exceeded' | 'met' | 'below';
  notes?: string;
}

export interface Availability {
  status: 'available' | 'limited' | 'booked';
  nextAvailable?: string;
  currentBookings: number;
  maxBookings: number;
}

export interface KOLFilter {
  tiers?: Tier[];
  platforms?: Platform[];
  categories?: Category[];
  locations?: string[];
  followerRange?: { min?: number; max?: number };
  engagementRange?: { min?: number; max?: number };
  gmvRange?: { min?: number; max?: number };
  contentTypes?: ContentType[];
  isLiveOnly?: boolean;
  isAvailable?: boolean;
  searchQuery?: string;
}

export interface SearchCriteria {
  objective?: 'awareness' | 'sales' | 'launch' | 'engagement' | 'partnership';
  targetAudience?: string;
  budget?: number;
  contentType?: ContentType;
  timeline?: {
    start: string;
    end: string;
  };
  minGMV?: number;
}

export interface MatchScore {
  kol: KOL;
  score: number;
  reasons: string[];
}
