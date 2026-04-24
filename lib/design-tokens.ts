/**
 * Semantic design token system.
 *
 * Maps domain concepts (categories, studios, trends) to Tailwind v4 semantic
 * color tokens (chart-1 … chart-5 + primary + studio-accent). Colors are
 * defined in globals.css via @theme inline and automatically adapt to
 * light/dark mode.
 *
 * Every exported class string is a complete literal so Tailwind's scanner
 * picks it up — no dynamic concatenation at the call site.
 *
 * @example
 *   import { CATEGORY_STYLES, STUDIO, TREND } from "@/lib/design-tokens";
 *
 *   <span className={CATEGORY_STYLES.cosmetics.dot} />
 *   <span className={STUDIO.text}>HypeStudio</span>
 *   <span className={TREND.up}>+12%</span>
 */

import type { ContentCategoryId } from "./taxonomy";

// ═════════════════════════════════════════════════════════════════
//  CATEGORY COLORS
// ═════════════════════════════════════════════════════════════════

/** Tailwind semantic color token name for each content category. */
const CATEGORY_COLOR: Record<ContentCategoryId, string> = {
  cosmetics: "chart-5", // pink
  health: "chart-2", // green
  food: "chart-1", // orange
  home: "chart-3", // purple/blue
  fashion: "chart-4", // lime/yellow-green
  "personal-care": "primary", // dark / accent
} as const;

/** Style keys available for every category. */
export interface CategoryStyle {
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
  playButtonBg: string;
  playButtonText: string;
  playGlow: string;
  activeBorder: string;
  mediaHoverBorder: string;
  ring: string;
}

/** Complete Tailwind class bundles per category.
 *  Spread the properties you need instead of inline styles. */
export const CATEGORY_STYLES: Record<ContentCategoryId, CategoryStyle> = {
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
} as const satisfies Record<ContentCategoryId, CategoryStyle>;

/** @deprecated Not used in any source file. Prefer CATEGORY_STYLES[catId] directly. */
export function categoryColorName(catId: ContentCategoryId | null): string {
  return catId ? CATEGORY_COLOR[catId] ?? "muted-foreground" : "muted-foreground";
}

/** Fallback style when an MC has no category. Uses neutral muted tokens. */
export const UNCATEGORIZED_STYLE: CategoryStyle = {
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
} as const satisfies CategoryStyle;

// ═════════════════════════════════════════════════════════════════
//  STUDIO TOKENS
// ═════════════════════════════════════════════════════════════════

/** HypeStudio brand accent — used across the studio showcase page.
 *  Compose with these tokens instead of hard-coding `studio-accent` classes. */
export const STUDIO = {
  text: "text-studio-accent",
  bg: "bg-studio-accent",
  bgSubtle: "bg-studio-accent/10",
  bgMuted: "bg-studio-accent/5",
  border: "border-studio-accent",
  borderSubtle: "border-studio-accent/20",
  borderHover: "hover:border-studio-accent/30",
  ring: "ring-studio-accent/30",
  glow: "bg-studio-accent/5",
  foreground: "text-studio-accent-foreground",
  badge: "bg-studio-accent/90 text-studio-accent-foreground",
  progress: "bg-studio-accent",
} as const;

// ═════════════════════════════════════════════════════════════════
//  TREND / DELTA TOKENS
// ═════════════════════════════════════════════════════════════════

/** Trend direction colors — positive, negative, neutral. */
export const TREND = {
  up: "text-chart-2",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

/** Trend badge/chip backgrounds — for Badge components. */
export const TREND_CHIP = {
  up: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  down: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  neutral: "bg-muted text-muted-foreground hover:bg-muted/80",
} as const;

/** Accent color for monetary values (fees, rate cards, pricing). */
export const VALUE_ACCENT = "text-chart-4" as const;

// ═════════════════════════════════════════════════════════════════
//  UI PATTERN TOKENS
// ═════════════════════════════════════════════════════════════════

/** Glassmorphism button / badge — play controls, badges, overlays.
 *  @example `<div className={cn(GLASS.base, GLASS.hover, "size-9 rounded-full")} />` */
export const GLASS = {
  base: "bg-background/70 backdrop-blur-md border border-foreground/10",
  hover: "hover:bg-background/90 transition-colors",
} as const;

/** Chip base — category chips, brand chips, filter chips.
 *  Compose with color tokens from CATEGORY_STYLES.
 *  @example `<span className={cn(CHIP.base, CHIP.md, categoryStyle.chipBg)} />` */
export const CHIP = {
  base: "inline-flex items-center font-medium border",
  sm: "gap-1 px-1.5 py-0.5 rounded-md text-2xs",
  md: "gap-1.5 px-2.5 py-1 rounded-full text-xs",
  lg: "gap-1.5 px-3.5 py-1.5 rounded-xl text-xs",
} as const;

/** Profile photo placeholder — initial-letter or image fallback.
 *  @example `<div className={cn(AVATAR.base, AVATAR.hover, "size-12", style.avatarBg)} />` */
export const AVATAR = {
  base: "relative shrink-0 rounded-xl flex items-center justify-center border font-bold overflow-hidden",
  hover: "transition-transform duration-200 group-hover:scale-105",
} as const;

/** Card container — reusable card shell. */
export const CARD = {
  base: "border border-border rounded-2xl overflow-hidden bg-card",
} as const;

/** Section header — icon + uppercase label pattern.
 *  @example
 *   <div className={SECTION_HEADER.base}>
 *     <Icon className={SECTION_HEADER.icon} />
 *     <h3 className={SECTION_HEADER.label}>{title}</h3>
 *   </div>
 */
export const SECTION_HEADER = {
  base: "flex items-center gap-2",
  label: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
  icon: "size-3.5 text-muted-foreground",
} as const;

/** Stats label — uppercase micro label (MCs, Brands, etc). */
export const STAT_LABEL = "text-2xs uppercase tracking-widest font-semibold" as const;

// ═════════════════════════════════════════════════════════════════
//  LAYOUT & SPACING TOKENS
// ═════════════════════════════════════════════════════════════════

/** Section layout — horizontal padding, container width, vertical spacing.
 *  @example `<section className={cn(SECTION.paddingX, SECTION.py)}>` */
export const SECTION = {
  paddingX: "px-6 md:px-12 lg:px-20",
  container: "max-w-7xl mx-auto",
  py: "py-20 md:py-32",
  pyLg: "py-24 md:py-40",
} as const;

// ═════════════════════════════════════════════════════════════════
//  TYPOGRAPHY TOKENS
// ═════════════════════════════════════════════════════════════════

/** Heading scale — consistent hierarchy across pages.
 *  @example `<h2 className={HEADING.section}>Title</h2>` */
export const HEADING = {
  hero: "text-[clamp(3.5rem,10vw,8rem)] font-black tracking-[-0.05em] leading-[0.82]",
  section: "text-4xl md:text-6xl font-black tracking-tight",
  sectionLg: "text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]",
  card: "text-2xl md:text-3xl font-black tracking-tight leading-tight",
} as const;

/** Micro label — uppercase eyebrow text above headings.
 *  @example `<span className={LABEL.micro}>What We Do</span>` */
export const LABEL = {
  micro: "text-xs uppercase tracking-widest text-muted-foreground font-medium",
} as const;

// ═════════════════════════════════════════════════════════════════
//  ANIMATION & MOTION TOKENS
// ═════════════════════════════════════════════════════════════════

/** Cubic-bezier easing curves used throughout the app.
 *  @example `transition-all duration-500 ${EASING.emphasized}` */
export const EASING = {
  default: "ease-out",
  emphasized: "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
  smooth: "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
  bounce: "[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
} as const;

/** Duration presets for consistent motion.
 *  @example `transition-all ${DURATION.fast} ease-out` */
export const DURATION = {
  fast: "duration-150",
  normal: "duration-300",
  slow: "duration-500",
  slower: "duration-700",
  slowest: "duration-1000",
  heroFade: "duration-[2000ms]",
  heroZoom: "duration-[8000ms]",
} as const;

/** Reusable animation class combinations.
 *  @example `<div className={cn(FADE_IN_UP, "delay-100")} />` */
export const FADE_IN_UP = "animate-fade-in-up" as const;
export const FADE_IN = "animate-fade-in" as const;
export const SCALE_IN = "animate-scale-in" as const;

/** Background overlay opacity presets.
 *  @example `<div className={cn("absolute inset-0", OVERLAY.medium)} />` */
export const OVERLAY = {
  subtle: "bg-background/30",
  light: "bg-background/40",
  medium: "bg-background/50",
  heavy: "bg-background/60",
  solid: "bg-background/80",
} as const;

/** Text opacity presets for foreground color.
 *  @example `<span className={cn(TEXT_OPACITY.muted)}>Subtitle</span>` */
export const TEXT_OPACITY = {
  dim: "text-foreground/50",
  muted: "text-foreground/60",
  normal: "text-foreground/90",
} as const;

/** Border opacity presets.
 *  @example `<div className={cn("border", BORDER_OPACITY.medium)} />` */
export const BORDER_OPACITY = {
  subtle: "border-border/20",
  light: "border-border/30",
  medium: "border-border/40",
} as const;

/** Foreground opacity presets for bg/text on dark/light surfaces.
 *  @example `<div className={cn("bg-foreground", FG_OPACITY.solid)} />` */
export const FG_OPACITY = {
  subtle: "bg-foreground/10",
  light: "bg-foreground/20",
  medium: "bg-foreground/50",
  heavy: "bg-foreground/90",
} as const;

// ═════════════════════════════════════════════════════════════════
//  SHADOW & ELEVATION TOKENS
// ═════════════════════════════════════════════════════════════════

/** Shadow presets for elevation system.
 *  @example `<Card className={SHADOW.md} />` */
export const SHADOW = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  glow: "shadow-studio-accent/10",
  glowLg: "shadow-studio-accent/20",
} as const;

// ═════════════════════════════════════════════════════════════════
//  GRADIENT TOKENS
// ═════════════════════════════════════════════════════════════════

/** Reusable gradient patterns.
 *  @example `<div className={GRADIENT.heroOverlay} />` */
export const GRADIENT = {
  heroOverlay: "bg-gradient-to-t from-background via-background/40 to-transparent",
  cardOverlay: "bg-gradient-to-t from-background/70 via-transparent to-transparent",
  bottomFade: "bg-gradient-to-t from-black/60 via-transparent to-transparent",
  topFade: "bg-gradient-to-b from-black/40 via-transparent to-transparent",
  cta: "bg-gradient-to-br from-muted/50 via-background to-muted/30",
  featuredRight: "bg-gradient-to-r from-transparent via-transparent to-background/60",
} as const;

// ═════════════════════════════════════════════════════════════════
//  DEPRECATED — kept for backward compatibility
// ═════════════════════════════════════════════════════════════════

/** @deprecated Not used in any source file. Use CATEGORY_STYLES or STUDIO tokens. */
export const TOGGLE = {
  base: "px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 transition-all duration-200",
  active: "bg-foreground/10 text-foreground",
  inactive: "text-muted-foreground hover:text-foreground hover:bg-foreground/10",
} as const;

/** @deprecated Not used in any source file. Use CHIP + CATEGORY_STYLES instead. */
export const FILTER_INACTIVE = "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border" as const;

/** @deprecated Not used in any source file. */
export const EMPTY_ICON = {
  sm: "size-16 rounded-full bg-muted border border-border flex items-center justify-center",
  lg: "size-20 rounded-2xl bg-muted border border-border flex items-center justify-center",
} as const;

/** @deprecated Not used in any source file. */
export const VIDEO_COVER = "absolute inset-0 size-full object-cover" as const;

/** @deprecated Not used in any source file. Use CARD.base instead. */
export const CARD_HERO = "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-background" as const;

// ═════════════════════════════════════════════════════════════════
//  CANVAS HELPERS
// ═════════════════════════════════════════════════════════════════

/** Read a CSS custom property value for use in Canvas 2D.
 *  Safe to call inside useEffect (browser only). */
export function cssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || ""
  );
}

/** Semantic canvas colors derived from the current CSS theme.
 *  Called inside useEffect (browser only) so document is always available. */
export function canvasColors() {
  return {
    textPrimary: cssVar("--foreground"),
    textMuted: cssVar("--muted-foreground"),
    textDimmed: cssVar("--border"),
    edgeHighlight: cssVar("--chart-3"),
    edgeDefault: cssVar("--border"),
    nodeStroke: cssVar("--background"),
  } as const;
}

/** Deterministic hue for an MC based on their handle (for wire-map nodes). */
export function mcHue(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ── OKLCH Parsing ───────────────────────────────────────────────

function parseOklch(value: string): { l: number; c: number; h: number } | null {
  const m = value
    .trim()
    .match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

/** Generate an OKLCH color string for canvas rendering.
 *  Reads live CSS custom properties so canvas stays in sync with the theme.
 *
 *  @param catId    Category to derive hue from, or null for grayscale.
 *  @param lightness  Target lightness (0–1). If omitted, uses the parsed
 *                    lightness from the CSS variable.
 *  @param hue      Manual hue override ( bypasses catId lookup ).
 *  @param chroma   Manual chroma override ( bypasses catId lookup ).
 *
 *  @example
 *   oklch("food", 0.7)           // oklch with food hue at 70% lightness
 *   oklch(null, 0.65, 200, 0.2)  // custom hue + chroma
 */
export function oklch(
  catId: ContentCategoryId | null,
  lightness?: number
): string;
export function oklch(
  catId: null,
  lightness: number,
  hue: number,
  chroma: number
): string;
export function oklch(
  catId: ContentCategoryId | null,
  lightness?: number,
  hue?: number,
  chroma?: number
): string {
  // Manual override path
  if (hue != null && chroma != null) {
    return `oklch(${lightness ?? 0.65} ${chroma} ${hue})`;
  }

  // Grayscale fallback
  if (!catId) return `oklch(${lightness ?? 0.65} 0 0)`;

  // Read from CSS custom property
  const cssValue = cssVar(`--${CATEGORY_COLOR[catId]}`);
  const parsed = parseOklch(cssValue);

  if (parsed) {
    // Use caller lightness if provided, otherwise fall back to CSS value
    const l = lightness ?? parsed.l;
    return `oklch(${l} ${parsed.c} ${parsed.h})`;
  }

  return `oklch(${lightness ?? 0.65} 0 0)`;
}

/** OKLCH with alpha — for canvas only. */
export function oklcha(
  catId: ContentCategoryId | null,
  lightness?: number,
  alpha = 1
): string {
  if (alpha >= 1) return oklch(catId, lightness);
  if (!catId) return `oklch(${lightness ?? 0.65} 0 0 / ${alpha})`;
  const base = oklch(catId, lightness);
  return base.replace(")", ` / ${alpha})`);
}
