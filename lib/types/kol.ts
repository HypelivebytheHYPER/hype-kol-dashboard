/**
 * Unified KOL Type Definitions
 * Merged from dashboard and discovery projects
 * Supports both naming conventions for backward compatibility
 */

// ============================================
// Platform Types
// ============================================

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook" | "x" | "shopee" | "lazada";

export type PlatformDisplay =
  | "TikTok"
  | "Instagram"
  | "YouTube"
  | "Facebook"
  | "X"
  | "Shopee"
  | "Lazada";

// ============================================
// Tier Types
// ============================================

/** Standard tier classification */
export type Tier = "nano" | "micro" | "mid" | "macro" | "mega";

/** Letter tier classification (from discovery) */
export type LetterTier = "S" | "A" | "B" | "C";

/** Combined tier type */
export type KOLTier = Tier | LetterTier;

// ============================================
// Category Types
// ============================================

export type Category =
  | "beauty"
  | "tech"
  | "fmcg"
  | "lifestyle"
  | "fashion"
  | "food"
  | "travel"
  | "health"
  | "parenting"
  | "gaming"
  | "finance"
  | "education";

export type KOLCategory = Category;

// ============================================
// Status Types
// ============================================

export type KOLStatus = "active" | "inactive" | "pending" | "suspended";

// ============================================
// Content Types
// ============================================

export type ContentType = "live" | "video" | "story" | "static" | "reel" | "short";

/** Display content type for discovery */
export type DisplayContentType = "Live streaming" | "Short video" | "Both";

// ============================================
// Core KOL Interface (Unified)
// ============================================

/**
 * Unified KOL interface
 * Supports both dashboard and discovery field naming
 */
export interface KOL {
  // Identity
  id: string;
  /** Primary name (dashboard convention) */
  name: string;
  /** Nickname (discovery convention) - alias for name */
  nickname?: string;
  handle: string;
  bio?: string;
  avatar?: string;
  profileImage?: string;

  // Classification
  platform: Platform | string;
  category?: Category | string;
  categories?: Category[];
  kolType?: string;
  tier?: KOLTier;
  verified?: boolean;

  // Performance Metrics
  followers: number;
  avgViews?: number;
  engagementRate: number;
  /** Average GMV (dashboard convention) */
  avgGMV?: number;
  /** Average monthly GMV (discovery convention) */
  avgMonthlyGMV?: number;
  avgLiveGMV?: number;
  totalGMV?: number;

  // Activity Metrics
  liveCount?: number;
  videoCount?: number;
  productCount?: number;
  campaignCount?: number;

  // Quality Indicators
  qualityScore: number;
  responseRate?: number;
  avgDeliveryTime?: number;

  // Business
  commissionRate?: number;
  minBudget?: number;
  maxBudget?: number;

  // Content Types
  contentTypes?: ContentType[];

  // Location
  location?: string;

  // Live Status
  isLiveNow?: boolean;
  liveStats?: LiveStats;

  // Contact
  lineId?: string;
  phone?: string;
  email?: string;
  preferredContact?: "line" | "phone" | "email";

  // Social Links
  tiktokUrl?: string;
  shopeeUrl?: string;
  instagramUrl?: string;

  // Audience
  audience?: AudienceDemographics;

  // Rate Card
  rateCard?: RateCard;

  // Campaign History
  campaignHistory?: CampaignHistory[];

  // Availability
  availability?: Availability;
  status?: KOLStatus;

  // Metadata
  debutDate?: string | Date;
  lastActive?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ============================================
// KOL Card Data (Discovery - Minimal)
// ============================================

/**
 * KOL for discovery card display (minimal, optimized)
 * Used in Tinder-style discovery interface
 */
export interface KOLCardData {
  id: string;
  nickname: string;
  handle: string;
  platform: string;
  category?: KOLCategory;
  tier: KOLTier;
  verified: boolean;
  profileImage?: string;
  followers: number;
  engagementRate: number;
  avgMonthlyGMV: number;
  liveCount: number;
  videoCount?: number;
  productCount?: number;
  qualityScore: number;
}

// ============================================
// KOL Display Data (For Client Proposals)
// ============================================

/**
 * KOL Display Data - Optimized for agency client proposals
 * Only includes fields shown to clients, hides internal status/contact
 */
export interface KOLDisplayData {
  // Identity
  id: string;
  nickname: string;
  handle: string;
  platform: string;
  category?: KOLCategory;
  tier: KOLTier;
  verified: boolean;
  profileImage?: string;

  // Primary Metrics (clients care about)
  followers: number;
  engagementRate: number;
  avgMonthlyGMV: string;
  qualityScore: number;

  // Content classification
  contentType: DisplayContentType;

  // Secondary metrics (shown in detail view)
  liveCount?: number;
  videoCount?: number;
  productCount?: number;

  // Bio
  bio?: string;

  // Social links
  tiktokUrl?: string;
  instagramUrl?: string;

  // Contact (only shown after added to campaign)
  phone?: string;
  lineId?: string;
  email?: string;
}

// ============================================
// Related Interfaces
// ============================================

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
  preferredMethod: "line" | "phone" | "email";
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
  performance: "exceeded" | "met" | "below";
  notes?: string;
}

export interface Availability {
  status: "available" | "limited" | "booked";
  nextAvailable?: string;
  currentBookings: number;
  maxBookings: number;
}

// ============================================
// Filter & Search Types
// ============================================

export interface KOLFilter {
  tiers?: KOLTier[];
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
  objective?: "awareness" | "sales" | "launch" | "engagement" | "partnership";
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

// ============================================
// Discovery Types
// ============================================

export type SwipeAction = "like" | "pass" | "superlike";

export interface SwipeHistory {
  kolId: string;
  action: SwipeAction;
  timestamp: Date;
}

export interface DiscoveryStats {
  totalSwiped: number;
  totalLiked: number;
  likeRate: number;
  superlikeCount: number;
  lastSwiped?: Date;
}

export interface FilterState {
  gmvRange: [number, number];
  followersRange: [number, number];
  engagementRange: [number, number];
  platforms: string[];
  categories: KOLCategory[];
  tiers: KOLTier[];
  status: KOLStatus[];
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationMeta {
  total: number;
  pageSize: number;
  pageToken?: string;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// Collection Types
// ============================================

export interface KOLCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  kols: KOL[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Utility Functions (type guards)
// ============================================

/**
 * Check if a KOL has the discovery-style nickname field
 */
export function hasNickname(kol: KOL | KOLCardData): kol is KOL & { nickname: string } {
  return "nickname" in kol && typeof kol.nickname === "string";
}

/**
 * Get display name for a KOL (handles both naming conventions)
 */
export function getKOLName(kol: KOL | KOLCardData): string {
  if ("nickname" in kol && kol.nickname) return kol.nickname;
  if ("name" in kol && kol.name) return kol.name;
  return "Unknown";
}

/**
 * Get GMV value (handles both naming conventions)
 */
export function getKOLGMV(kol: KOL | KOLCardData): number {
  if ("avgMonthlyGMV" in kol && typeof kol.avgMonthlyGMV === "number") return kol.avgMonthlyGMV;
  if ("avgGMV" in kol && typeof kol.avgGMV === "number") return kol.avgGMV;
  return 0;
}
