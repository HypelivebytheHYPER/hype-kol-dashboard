// Types matching Lark Base table schemas — single source of truth.
// Also hosts app-level shared types like ErrorProps (Next.js error boundary).

// ============ App-level shared types ============

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============ Lark Base table schemas ============

// ALL_KOLS (tbl5864QVOiEokTQ)
// Note: Lark stores one row per fee package, so a single creator can span
// multiple rows. `fees` aggregates the package range after dedupe().
export interface Creator {
  id: string;
  kolId: string;
  name: string;
  handle: string;
  platform: string;
  tier: string;
  followers: number;
  engagementRate: number;
  avgGMV: number;
  avgLiveGMV: number;
  qualityScore: number;
  categories: string[];
  location: string;
  kolType: string;
  contact: { lineId: string; phone: string; email: string };
  stats: {
    liveGmv: number;
    videoGmv: number;
    revenue: number;
    views: number;
    productCount: number;
    liveNum: number;
    videoNum: number;
  };
  bio: { th: string; en: string };
  condition: string;
  scope: string;
  sourceUrl: string;
  channel: string;
  fees: { min: number; max: number; count: number } | null;
  accountType?: string;
  /** Profile image URL — populated from image attachments when available */
  image?: string;
}

// LIVE_MC_LIST (tblozhTWBHelXqRR)
export interface LiveMC {
  id: string;
  handle: string;
  brands: string[];
  categories: string[];
  contentCategories: string[];
  videos: { token: string; name: string }[];
  /** All image attachments from LIVE Reference field (proper token URLs) */
  images: { token: string; url: string; name: string }[];
  /** First image — used as avatar */
  image?: string;
}

// DASHBOARD_SUMMARY (tblOwkSqf5rci6zq)
// Pre-computed KPI metrics for fast dashboard loading.
// One row per metric per dashboard type per period.
export interface DashboardMetric {
  id: string;
  period: string;
  dashboardType: "overview" | "performance" | "gmv" | "engagement";
  metricKey: string;
  metricLabel: string;
  metricValue: number;
  metricUnit: string;
  change: number;
  trend: "up" | "down" | "neutral";
}
