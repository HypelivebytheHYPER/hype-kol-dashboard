// App-wide magic numbers and route paths. Named constants so a future tweak
// lands in one place and the meaning is grep-able.

// ============ Pagination ============

/** Card grid page size on /kols. Tuned to fit 2×3 on desktop and 1×6 on
 * mobile without awkward orphans. */
export const ITEMS_PER_PAGE = 12;

// ============ ISR Revalidation ============

/** Default ISR revalidate interval in seconds (5 minutes). */
export const REVALIDATE_SECONDS = 300;

// ============ Timing (milliseconds) ============

/** Delay before focusing first element in a focus-trapped drawer.
 *  Gives the browser time to mount the element into the DOM. */
export const FOCUS_TRAP_DELAY_MS = 50;

/** Delay before redirecting/closing after a successful form submission.
 *  Lets the user see the success state briefly. */
export const SUCCESS_REDIRECT_DELAY_MS = 2000;

/** Hero image carousel auto-advance interval on /hypestudio. */
export const HERO_CAROUSEL_INTERVAL_MS = 6000;

/** Delay before recalculating slideshow layout after detail panel toggle.
 *  Must match or exceed the CSS transition duration. */
export const SLIDESHOW_RECALC_DELAY_MS = 350;

/** Tooltip hover delay before showing content. */
export const TOOLTIP_DELAY_MS = 300;

/** Reveal animation delays — used by Framer Motion stagger on /hypestudio. */
export const ANIMATION_DELAY_SHORT_MS = 100;
export const ANIMATION_DELAY_NORMAL_MS = 150;
export const ANIMATION_DELAY_MEDIUM_MS = 200;
export const ANIMATION_DELAY_LONG_MS = 300;
export const ANIMATION_STAGGER_MS = 80;

/** Intersection Observer threshold for scroll-triggered reveals. */
export const INTERSECTION_THRESHOLD = 0.15;

// ============ Page sizes ============

/** Live catalog initial fetch page size. */
export const LIVE_CATALOG_PAGE_SIZE = 200;

/** Max studios to preview on /hypestudio hero section. */
export const MAX_STUDIO_PREVIEW = 10;

/** Max category badges shown per MC card. */
export const MAX_CATEGORY_BADGES = 2;

// ============ OG / Meta ============

/** OpenGraph image dimensions. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Mobile browser theme color (dark mode). */
export const THEME_COLOR = "#000000";

// ============ UI Limits ============

/** Max number of brand filter chips to show in the live catalog sidebar. */
export const VISIBLE_BRAND_LIMIT = 16;

// ============ Profile radar chart ceilings ============

// Each axis of the performance radar is normalised to 0–100. The ceiling is
// the "headline" value we call a full circle — tuning these shifts every
// KOL's shape on the radar relative to the top of the market.
export const RADAR_CEILINGS = {
  followers: 5_000_000,
  gmv: 5_000_000,
  revenue: 30_000_000,
  content: 50,
  quality: 5,
} as const;

/** Engagement rate is a percentage up to ~30 in practice, but Lark sometimes
 * emits a raw count when the formula overflows. Anything > 100 is treated as
 * the count path; below that it's a genuine percent. */
export const ENGAGEMENT_COUNT_THRESHOLD = 100;

// ============ Routes ============

export const ROUTES = {
  KOLS: "/kols",
  LIVE: "/live",
  DASHBOARD: "/dashboard",
  HYPESTUDIO: "/hypestudio",
} as const;

/** Valid dashboard types for /dashboard/[dashboard-type] */
export const DASHBOARD_TYPES = ["overview", "performance", "gmv", "engagement"] as const;
export type DashboardType = (typeof DASHBOARD_TYPES)[number];

export function dashboardPath(type: DashboardType): string {
  return `${ROUTES.DASHBOARD}/${type}`;
}

export function kolProfilePath(id: string): string {
  return `${ROUTES.KOLS}/${id}`;
}

// ============ Brand ============

import { SERVICES } from "./external-services";

export const BRAND = {
  name: "HypeCreators",
  logoUrl: `${SERVICES.r2Brand}/Hypeshop%20transparent.png`,
} as const;

// ============ Tier colors / order ============

const TIER_COLORS: Record<string, string> = {
  "Mega KOL": "bg-chart-5",
  "Macro KOL": "bg-chart-3",
  "Micro KOL": "bg-chart-2",
  "Nano KOL": "bg-chart-4",
};

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier] ?? "bg-muted";
}

export const TIER_ORDER = [
  "Mega KOL",
  "Macro KOL",
  "Micro KOL",
  "Nano KOL",
] as const;

// ============ Navigation ============

import { Users, Video, Radio, Search, LayoutDashboard, Sparkles, type LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  isAction?: boolean;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: "Creators", href: ROUTES.KOLS, icon: Users },
  { name: "Live Catalog", href: ROUTES.LIVE, icon: Video },
  { name: "HypeStudio", href: ROUTES.HYPESTUDIO, icon: Sparkles },
] as const;

export const MOBILE_BOTTOM_NAV: readonly NavItem[] = [
  { name: "Creators", href: ROUTES.KOLS, icon: Users },
  { name: "Search", href: "#search", icon: Search, isAction: true },
  { name: "Live", href: ROUTES.LIVE, icon: Radio },
  { name: "Studio", href: ROUTES.HYPESTUDIO, icon: Sparkles },
] as const;
