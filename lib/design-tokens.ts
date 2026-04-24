/**
 * Semantic design token system for category colors.
 *
 * Maps each content category to a Tailwind v4 semantic color token
 * (chart-1 … chart-5 + primary). These are defined in globals.css
 * via @theme inline and automatically adapt to light/dark mode.
 *
 * Usage: import CATEGORY_STYLES and spread the classes you need.
 * Every class is a complete literal string so Tailwind's scanner
 * picks it up — no dynamic concatenation.
 */

import type { ContentCategoryId } from "./taxonomy";

/** Tailwind semantic color token name for each category. */
const CATEGORY_COLOR: Record<ContentCategoryId, string> = {
  cosmetics:     "chart-5",  // pink
  health:        "chart-2",  // green
  food:          "chart-1",  // orange
  home:          "chart-3",  // purple/blue
  fashion:       "chart-4",  // lime/yellow-green
  "personal-care": "primary", // dark / accent
};

/** Complete Tailwind class bundles per category.
 *  Use these instead of inline styles so colors stay in the design system. */
export const CATEGORY_STYLES: Record<ContentCategoryId, {
  dot: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  avatarBg: string;
  avatarBorder: string;
  avatarText: string;
  filterActiveBg: string;
  filterActiveBorder: string;
  filterActiveShadow: string;
  /** Play button background (list item, thumbnail) */
  playButtonBg: string;
  /** Play button icon color */
  playButtonText: string;
  /** Glow behind large play button */
  playGlow: string;
  /** Border for active/selected rows and media */
  activeBorder: string;
  /** Hover border for media thumbnails */
  mediaHoverBorder: string;
  /** Ring color for active/selected state */
  ring: string;
}> = {
  cosmetics: {
    dot: "bg-chart-5",
    chipBg: "bg-chart-5/10",
    chipBorder: "border-chart-5/20",
    chipText: "text-chart-5",
    avatarBg: "bg-chart-5/15",
    avatarBorder: "border-chart-5/25",
    avatarText: "text-chart-5",
    filterActiveBg: "bg-chart-5/15",
    filterActiveBorder: "border-chart-5/30",
    filterActiveShadow: "shadow-chart-5/10",
    playButtonBg: "bg-chart-5/15",
    playButtonText: "text-chart-5",
    playGlow: "bg-chart-5/30",
    activeBorder: "border-chart-5/20",
    mediaHoverBorder: "hover:border-chart-5/40",
    ring: "ring-chart-5/30",
  },
  health: {
    dot: "bg-chart-2",
    chipBg: "bg-chart-2/10",
    chipBorder: "border-chart-2/20",
    chipText: "text-chart-2",
    avatarBg: "bg-chart-2/15",
    avatarBorder: "border-chart-2/25",
    avatarText: "text-chart-2",
    filterActiveBg: "bg-chart-2/15",
    filterActiveBorder: "border-chart-2/30",
    filterActiveShadow: "shadow-chart-2/10",
    playButtonBg: "bg-chart-2/15",
    playButtonText: "text-chart-2",
    playGlow: "bg-chart-2/30",
    activeBorder: "border-chart-2/20",
    mediaHoverBorder: "hover:border-chart-2/40",
    ring: "ring-chart-2/30",
  },
  food: {
    dot: "bg-chart-1",
    chipBg: "bg-chart-1/10",
    chipBorder: "border-chart-1/20",
    chipText: "text-chart-1",
    avatarBg: "bg-chart-1/15",
    avatarBorder: "border-chart-1/25",
    avatarText: "text-chart-1",
    filterActiveBg: "bg-chart-1/15",
    filterActiveBorder: "border-chart-1/30",
    filterActiveShadow: "shadow-chart-1/10",
    playButtonBg: "bg-chart-1/15",
    playButtonText: "text-chart-1",
    playGlow: "bg-chart-1/30",
    activeBorder: "border-chart-1/20",
    mediaHoverBorder: "hover:border-chart-1/40",
    ring: "ring-chart-1/30",
  },
  home: {
    dot: "bg-chart-3",
    chipBg: "bg-chart-3/10",
    chipBorder: "border-chart-3/20",
    chipText: "text-chart-3",
    avatarBg: "bg-chart-3/15",
    avatarBorder: "border-chart-3/25",
    avatarText: "text-chart-3",
    filterActiveBg: "bg-chart-3/15",
    filterActiveBorder: "border-chart-3/30",
    filterActiveShadow: "shadow-chart-3/10",
    playButtonBg: "bg-chart-3/15",
    playButtonText: "text-chart-3",
    playGlow: "bg-chart-3/30",
    activeBorder: "border-chart-3/20",
    mediaHoverBorder: "hover:border-chart-3/40",
    ring: "ring-chart-3/30",
  },
  fashion: {
    dot: "bg-chart-4",
    chipBg: "bg-chart-4/10",
    chipBorder: "border-chart-4/20",
    chipText: "text-chart-4",
    avatarBg: "bg-chart-4/15",
    avatarBorder: "border-chart-4/25",
    avatarText: "text-chart-4",
    filterActiveBg: "bg-chart-4/15",
    filterActiveBorder: "border-chart-4/30",
    filterActiveShadow: "shadow-chart-4/10",
    playButtonBg: "bg-chart-4/15",
    playButtonText: "text-chart-4",
    playGlow: "bg-chart-4/30",
    activeBorder: "border-chart-4/20",
    mediaHoverBorder: "hover:border-chart-4/40",
    ring: "ring-chart-4/30",
  },
  "personal-care": {
    dot: "bg-primary",
    chipBg: "bg-primary/10",
    chipBorder: "border-primary/20",
    chipText: "text-primary",
    avatarBg: "bg-primary/15",
    avatarBorder: "border-primary/25",
    avatarText: "text-primary",
    filterActiveBg: "bg-primary/15",
    filterActiveBorder: "border-primary/30",
    filterActiveShadow: "shadow-primary/10",
    playButtonBg: "bg-primary/15",
    playButtonText: "text-primary",
    playGlow: "bg-primary/30",
    activeBorder: "border-primary/20",
    mediaHoverBorder: "hover:border-primary/40",
    ring: "ring-primary/30",
  },
};

/** Get the semantic color token name for a category (for wire-map, canvas, etc). */
export function categoryColorName(catId: ContentCategoryId | null): string {
  return catId ? CATEGORY_COLOR[catId] ?? "muted-foreground" : "muted-foreground";
}

/** Deterministic hue for an MC based on their handle (for wire-map nodes). */
export function mcHue(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/** Generate an OKLCH color string for canvas rendering.
 *  Only used in wire-map.tsx where CSS classes can't reach. */
export function oklch(catId: ContentCategoryId | null, lightness?: number): string;
export function oklch(catId: null, lightness: number, hue: number, chroma: number): string;
export function oklch(catId: ContentCategoryId | null, lightness = 0.65, hue?: number, chroma?: number): string {
  if (hue != null && chroma != null) {
    return `oklch(${lightness} ${chroma} ${hue})`;
  }
  if (!catId) return `oklch(${lightness} 0 0)`;
  // Map to chart color OKLCH values for canvas consistency
  const map: Record<ContentCategoryId, { h: number; c: number }> = {
    cosmetics:     { h: 350, c: 0.24 },
    health:        { h: 165, c: 0.20 },
    food:          { h: 35,  c: 0.22 },
    home:          { h: 280, c: 0.22 },
    fashion:       { h: 140, c: 0.20 },
    "personal-care": { h: 0,   c: 0 },
  };
  const t = map[catId];
  if (!t) return `oklch(${lightness} 0 0)`;
  return `oklch(${lightness} ${t.c} ${t.h})`;
}

/** OKLCH with alpha — for canvas only. */
export function oklcha(catId: ContentCategoryId | null, lightness = 0.65, alpha = 1): string {
  if (alpha >= 1) return oklch(catId, lightness);
  if (!catId) return `oklch(${lightness} 0 0 / ${alpha})`;
  const base = oklch(catId, lightness);
  return base.replace(")", ` / ${alpha})`);
}

/** Fallback style when an MC has no category. Uses neutral muted tokens. */
export const UNCATEGORIZED_STYLE = {
  dot: "bg-muted-foreground",
  chipBg: "bg-muted",
  chipBorder: "border-border",
  chipText: "text-muted-foreground",
  avatarBg: "bg-muted",
  avatarBorder: "border-border",
  avatarText: "text-muted-foreground",
  filterActiveBg: "bg-muted",
  filterActiveBorder: "border-border",
  filterActiveShadow: "shadow-foreground/10",
  playButtonBg: "bg-muted",
  playButtonText: "text-muted-foreground",
  playGlow: "bg-primary/30",
  activeBorder: "border-border",
  mediaHoverBorder: "hover:border-foreground/20",
  ring: "ring-primary/30",
} as const;

// ── Canvas helpers ──────────────────────────────────────────────────

/** Read a CSS custom property value for use in Canvas 2D. */
export function cssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "";
}

/** Semantic canvas colors derived from the current CSS theme. */
export function canvasColors() {
  return {
    textPrimary: cssVar("--foreground") || "oklch(0.145 0 0)",
    textMuted: cssVar("--muted-foreground") || "oklch(0.556 0 0)",
    textDimmed: cssVar("--border") || "oklch(0.922 0 0)",
    edgeHighlight: cssVar("--chart-3") || "oklch(0.6 0.22 280)",
    edgeDefault: cssVar("--border") || "oklch(0.922 0 0)",
    nodeStroke: cssVar("--background") || "oklch(1 0 0)",
  };
}
