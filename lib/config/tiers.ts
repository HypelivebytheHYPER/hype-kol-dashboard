// Tier configuration - base rates in THB
export const TIER_BASE_RATES: Record<string, number> = {
  "Nano KOL": 5000,
  "Micro KOL": 25000,
  "Mid-tier": 80000,
  "Macro KOL": 250000,
  "Mega KOL": 800000,
};

// Default rate for unknown tiers
export const DEFAULT_TIER_RATE = 25000;

// Tier display order
export const TIER_ORDER = ["Mega KOL", "Macro KOL", "Mid-tier", "Micro KOL", "Nano KOL"];

// Tier colors for UI
export const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Mega KOL": { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  "Macro KOL": { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
  "Mid-tier": { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  "Micro KOL": { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20" },
  "Nano KOL": { bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-500/20" },
};

// Get base rate for a tier
export function getTierBaseRate(tier: string | undefined): number {
  if (!tier) return DEFAULT_TIER_RATE;
  return TIER_BASE_RATES[tier] ?? DEFAULT_TIER_RATE;
}

// Calculate total estimated budget for KOLs
export function calculateEstimatedBudget(kols: { tier?: string }[]): number {
  return kols.reduce((sum, k) => sum + getTierBaseRate(k.tier), 0);
}
