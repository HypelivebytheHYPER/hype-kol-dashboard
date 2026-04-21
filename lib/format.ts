// Number + currency formatters. One module for every visual render of numeric
// data so abbreviations (K/M), currency prefix (฿), em-dash for zero, and
// fee-range collapse all stay consistent across the app.

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(0)}K`;
  return `฿${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

/** Render a numeric value, or an em-dash when zero/missing. Single source for
 * the "no data" placeholder so UI stays consistent across tiles/cards. */
export function numOrDash(
  value: number,
  format: (n: number) => string = formatNumber
): string {
  return value > 0 ? format(value) : "—";
}

/** Collapse a fee range to a single currency string when min === max, or a
 * dashed range otherwise. Caller picks the separator ("–" tight for chips,
 * " – " with spaces for banded rows). */
export function formatFeeRange(
  fees: { min: number; max: number },
  separator = "–"
): string {
  if (fees.min === fees.max) return formatCurrency(fees.min);
  return `${formatCurrency(fees.min)}${separator}${formatCurrency(fees.max)}`;
}

/** Normalise engagement rate — Lark emits a % under 100 but a raw count when
 * the computation overflows (spike outliers). Render accordingly. */
export function formatEngagement(rate: number): string {
  if (rate > 100) return formatNumber(rate);
  return `${rate.toFixed(2)}%`;
}
