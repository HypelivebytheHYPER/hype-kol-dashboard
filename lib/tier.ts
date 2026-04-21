// Maps Lark `Levels of KOLs` values to the project's chart palette tokens
// (see `--chart-*` in globals.css). Unknown tiers fall back to muted so the
// badge still renders with on-theme neutral chrome instead of a palette miss.

const TIER_COLORS: Record<string, string> = {
  "Mega KOL": "bg-chart-5",
  "Macro KOL": "bg-chart-3",
  "Mid-tier": "bg-chart-1",
  "Micro KOL": "bg-chart-2",
  "Nano KOL": "bg-chart-4",
  "Emerging KOL": "bg-muted",
};

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier] ?? "bg-muted";
}

/** Seniority order — UI uses this to sort the tier filter toggle and intersect
 * with the set of tiers actually present in the loaded data. */
export const TIER_ORDER = [
  "Mega KOL",
  "Macro KOL",
  "Mid-tier",
  "Micro KOL",
  "Nano KOL",
  "Emerging KOL",
] as const;
