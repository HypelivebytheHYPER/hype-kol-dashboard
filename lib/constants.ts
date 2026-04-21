// App-wide magic numbers and route paths. Named constants so a future tweak
// lands in one place and the meaning is grep-able.

// ============ Pagination ============

/** Card grid page size on /kols. Tuned to fit 2×3 on desktop and 1×6 on
 * mobile without awkward orphans. */
export const ITEMS_PER_PAGE = 6;

// ============ ISR Revalidation ============

/** Default ISR revalidate interval in seconds (5 minutes). */
export const REVALIDATE_SECONDS = 300;

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
} as const;

export function kolProfilePath(handle: string): string {
  return `${ROUTES.KOLS}/${encodeURIComponent(handle)}`;
}
