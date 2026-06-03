/**
 * Semantic Design Token System — shadcn/ui aligned
 *
 * Architecture:
 *   1. PRIMITIVES: CSS custom properties from globals.css (colors, radius, etc.)
 *   2. SEMANTIC: Domain-meaningful names that map to primitives (TREND.up → text-chart-2)
 *   3. COMPONENT: Ready-to-use class combinations (CHIP.base + CHIP.md)
 *
 * Every export is a complete literal string for Tailwind v4 scanner compatibility.
 * No dynamic concatenation at call sites.
 *
 * @example
 *   import { CATEGORY_STYLES, STUDIO, TREND, RADIUS, SHADOW } from "@/lib/design-tokens";
 *   <span className={`${CATEGORY_STYLES.cosmetics.dot} ${RADIUS.full}`} />
 */

import type { ContentCategoryId } from "./taxonomy";

// ═══════════════════════════════════════════════════════════════════════════════
//  1. PRIMITIVE TOKEN REFERENCES (map to CSS vars in globals.css)
// ═══════════════════════════════════════════════════════════════════════════════

/** Primitive color tokens — these map directly to CSS custom properties.
 *  Use for one-offs; prefer SEMANTIC tokens for most cases. */
export const COLOR = {
  background: "bg-background",
  foreground: "text-foreground",
  card: "bg-card",
  "card-foreground": "text-card-foreground",
  popover: "bg-popover",
  "popover-foreground": "text-popover-foreground",
  primary: "bg-primary",
  "primary-foreground": "text-primary-foreground",
  secondary: "bg-secondary",
  "secondary-foreground": "text-secondary-foreground",
  muted: "bg-muted",
  "muted-foreground": "text-muted-foreground",
  accent: "bg-accent",
  "accent-foreground": "text-accent-foreground",
  destructive: "bg-destructive",
  "destructive-foreground": "text-destructive-foreground",
  border: "border-border",
  input: "border-input",
  ring: "ring-ring",
  // Chart colors for data visualization
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  // Sidebar
  sidebar: "bg-sidebar",
  "sidebar-foreground": "text-sidebar-foreground",
  "sidebar-primary": "bg-sidebar-primary",
  "sidebar-accent": "bg-sidebar-accent",
  // Studio accent
  "studio-accent": "bg-studio-accent",
} as const;

/** Text color shortcuts */
export const TEXT = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  disabled: "text-muted-foreground/50",
  inverse: "text-background",
  brand: "text-primary",
  success: "text-chart-2",
  warning: "text-chart-1",
  danger: "text-destructive",
  info: "text-chart-3",
  cardTitle: "text-foreground font-semibold text-sm leading-tight truncate",
} as const;

/** Background color shortcuts */
export const BG = {
  surface: "bg-background",
  elevated: "bg-card",
  overlay: "bg-background/80",
  muted: "bg-muted",
  accent: "bg-accent",
  brand: "bg-primary",
  success: "bg-chart-2/10",
  warning: "bg-chart-1/10",
  danger: "bg-destructive/10",
  info: "bg-chart-3/10",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  2. SEMANTIC DOMAIN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLOR: Record<ContentCategoryId, string> = {
  cosmetics: "chart-5",
  health: "chart-2",
  food: "chart-1",
  home: "chart-3",
  fashion: "chart-4",
  "personal-care": "primary",
} as const;

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

/** Static category styles — every value is a literal string so Tailwind v4's
 *  scanner can see and generate all utility classes. Do NOT use dynamic
 *  concatenation here. */
function catStyle(color: string): CategoryStyle {
  // This switch is evaluated at build time by the TypeScript compiler;
  // each branch returns a fully literal object.
  switch (color) {
    case "chart-1":
      return {
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
      };
    case "chart-2":
      return {
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
      };
    case "chart-3":
      return {
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
      };
    case "chart-4":
      return {
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
      };
    case "chart-5":
      return {
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
      };
    case "primary":
      return {
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
      };
    case "muted-foreground":
      return {
        dot: "bg-muted-foreground",
        chipBg: "bg-muted-foreground/10",
        chipBorder: "border-muted-foreground/20",
        chipText: "text-muted-foreground",
        avatarBg: "bg-muted-foreground/15",
        avatarBorder: "border-muted-foreground/25",
        avatarText: "text-muted-foreground",
        filterActiveBg: "bg-muted-foreground/15",
        filterActiveBorder: "border-muted-foreground/30",
        filterActiveShadow: "shadow-muted-foreground/10",
        playButtonBg: "bg-muted-foreground/15",
        playButtonText: "text-muted-foreground",
        playGlow: "bg-muted-foreground/30",
        activeBorder: "border-muted-foreground/20",
        mediaHoverBorder: "hover:border-muted-foreground/40",
        ring: "ring-muted-foreground/30",
      };
    default:
      // Fallback — should never hit in practice
      return {
        dot: "bg-muted-foreground",
        chipBg: "bg-muted-foreground/10",
        chipBorder: "border-muted-foreground/20",
        chipText: "text-muted-foreground",
        avatarBg: "bg-muted-foreground/15",
        avatarBorder: "border-muted-foreground/25",
        avatarText: "text-muted-foreground",
        filterActiveBg: "bg-muted-foreground/15",
        filterActiveBorder: "border-muted-foreground/30",
        filterActiveShadow: "shadow-muted-foreground/10",
        playButtonBg: "bg-muted-foreground/15",
        playButtonText: "text-muted-foreground",
        playGlow: "bg-muted-foreground/30",
        activeBorder: "border-muted-foreground/20",
        mediaHoverBorder: "hover:border-muted-foreground/40",
        ring: "ring-muted-foreground/30",
      };
  }
}

export const CATEGORY_STYLES: Record<ContentCategoryId, CategoryStyle> = {
  cosmetics: catStyle("chart-5"),
  health: catStyle("chart-2"),
  food: catStyle("chart-1"),
  home: catStyle("chart-3"),
  fashion: catStyle("chart-4"),
  "personal-care": catStyle("primary"),
} as const;

export const UNCATEGORIZED_STYLE: CategoryStyle = catStyle("muted-foreground");

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

export const TREND = {
  up: "text-chart-2",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

export const TREND_CHIP = {
  up: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  down: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  neutral: "bg-muted text-muted-foreground hover:bg-muted/80",
} as const;

export const TREND_BG = {
  up: "bg-chart-2/10",
  down: "bg-destructive/10",
  neutral: "bg-muted",
} as const;

export const VALUE_ACCENT = "text-chart-4" as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  3. SHAPE & LAYOUT TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const GLASS = {
  base: "bg-background/70 backdrop-blur-md border border-foreground/10",
  hover: "hover:bg-background/90 transition-colors",
} as const;

export const CHIP = {
  base: "inline-flex items-center font-medium border",
  sm: "gap-1 px-1.5 py-0.5 rounded-md text-2xs",
  md: "gap-1.5 px-2.5 py-1 rounded-full text-xs",
  lg: "gap-1.5 px-3.5 py-1.5 rounded-xl text-xs",
} as const;

export const AVATAR = {
  base: "relative shrink-0 rounded-xl flex items-center justify-center border font-bold overflow-hidden",
  hover: "transition-transform duration-200 group-hover:scale-105",
} as const;

export const CARD = {
  base: "border border-border rounded-2xl overflow-hidden bg-card",
  interactive: "border border-border rounded-2xl overflow-hidden bg-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
} as const;

export const SHADOW = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  glow: "shadow-studio-accent/10",
  glowLg: "shadow-studio-accent/20",
} as const;

export const GRADIENT = {
  heroOverlay: "bg-gradient-to-t from-background via-background/40 to-transparent",
  cardOverlay: "bg-gradient-to-t from-background/70 via-transparent to-transparent",
  bottomFade: "bg-gradient-to-t from-black/60 via-transparent to-transparent",
  topFade: "bg-gradient-to-b from-black/40 via-transparent to-transparent",
  cta: "bg-gradient-to-br from-muted/50 via-background to-muted/30",
  featuredRight: "bg-gradient-to-r from-transparent via-transparent to-background/60",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  4. SPACE & TYPOGRAPHY TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const SECTION = {
  paddingX: "px-6 md:px-12 lg:px-20",
  container: "max-w-7xl mx-auto",
  py: "py-20 md:py-32",
  pyLg: "py-24 md:py-40",
} as const;

export const SECTION_HEADER = {
  base: "flex items-center gap-2",
  label: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
  icon: "size-3.5 text-muted-foreground",
} as const;

export const HEADING = {
  hero: "text-[clamp(3.5rem,10vw,8rem)] font-black tracking-[-0.05em] leading-[0.82]",
  section: "text-4xl md:text-6xl font-black tracking-tight",
  sectionLg: "text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]",
  card: "text-2xl md:text-3xl font-black tracking-tight leading-tight",
} as const;

export const LABEL = {
  micro: "text-xs uppercase tracking-widest text-muted-foreground font-medium",
} as const;

export const STAT_LABEL = "text-2xs uppercase tracking-widest font-semibold" as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  5. MOTION TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const EASING = {
  default: "ease-out",
  emphasized: "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
  smooth: "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
  bounce: "[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
} as const;

export const DURATION = {
  fast: "duration-150",
  moderate: "duration-200",
  normal: "duration-300",
  slow: "duration-500",
  slower: "duration-700",
  slowest: "duration-1000",
  heroFade: "duration-[2000ms]",
  heroZoom: "duration-[8000ms]",
} as const;

export const FADE_IN_UP = "animate-fade-in-up" as const;
export const FADE_IN = "animate-fade-in" as const;
export const SCALE_IN = "animate-scale-in" as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  6. OPACITY & OVERLAY TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const OVERLAY = {
  subtle: "bg-background/30",
  light: "bg-background/40",
  medium: "bg-background/50",
  heavy: "bg-background/60",
  solid: "bg-background/80",
} as const;

export const TEXT_OPACITY = {
  dim: "text-foreground/50",
  muted: "text-foreground/60",
  normal: "text-foreground/90",
} as const;

export const BORDER_OPACITY = {
  subtle: "border-border/20",
  light: "border-border/30",
  medium: "border-border/40",
} as const;

export const FG_OPACITY = {
  subtle: "bg-foreground/10",
  light: "bg-foreground/20",
  medium: "bg-foreground/50",
  heavy: "bg-foreground/90",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  7. INTERACTIVE STATE TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const SELECTION_CHECKBOX = {
  base: "absolute z-20 size-6 rounded-full border-2 flex items-center justify-center transition-all",
  checked: "bg-primary border-primary text-primary-foreground",
  unchecked: `${OVERLAY.light} border-foreground/50 text-foreground/70 hover:bg-background/60`,
} as const;

export const RING = {
  selected: "ring-2 ring-primary ring-offset-2 ring-offset-background",
  focus: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
} as const;

export const ELEVATION = {
  hover: "hover:shadow-lg hover:-translate-y-0.5 transition-all",
  hoverSm: "hover:shadow-md hover:-translate-y-0.5 transition-all",
} as const;

export const PLAY_BUTTON = {
  wrapper: "absolute inset-0 flex items-center justify-center z-10 opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto transition-opacity",
  base: "rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90",
  active: "bg-primary/80 border-primary/30 text-primary-foreground",
  inactive: `${OVERLAY.light} border-foreground/20 text-foreground`,
} as const;

export const MEDIA = {
  cover: "absolute inset-0 size-full object-cover",
} as const;

export const BADGE = {
  glass: "inline-flex items-center gap-1 rounded-full backdrop-blur-md text-foreground/80 text-2xs font-semibold border border-foreground/10",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  8. DIMENSION TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const ASPECT = {
  portrait: "aspect-[3/4]",
  video: "aspect-[9/16]",
  wide: "aspect-[4/3]",
  studio: "aspect-[4/5]",
  chart: "aspect-[16/9]",
  square: "aspect-square",
} as const;

export const MAX_HEIGHT = {
  card: "max-h-[480px]",
  video: "max-h-[520px]",
  videoLg: "max-h-[640px]",
  videoPlayer: "max-h-[520px] lg:max-h-[640px]",
} as const;

export const WIDTH = {
  contentMax: "max-w-[1200px]",
  studioCard: "w-[280px] sm:w-[300px] md:w-[340px]",
  detailPanel: "w-full sm:w-[420px] lg:w-[480px]",
  detailPanelSm: "sm:w-[420px]",
  detailPanelLg: "lg:w-[480px]",
  detailPanelMin: "min-w-[320px]",
  tooltipMax: "max-w-[220px]",
  dropdownMin: "min-w-[180px]",
} as const;

export const HERO = {
  height: "h-[100dvh]",
} as const;

export const SCALE = {
  hover: "scale-[1.04]",
  active: "active:scale-[0.98]",
  press: "active:scale-95",
} as const;

export const RADIUS = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
  full: "rounded-full",
} as const;

export const Z_INDEX = {
  base: "z-0",
  gradient: "z-[1]",
  content: "z-10",
  controls: "z-30",
  overlay: "z-40",
  modal: "z-50",
} as const;

export const DROP_SHADOW = {
  sm: "drop-shadow-sm",
  md: "drop-shadow-md",
  lg: "drop-shadow-lg",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  9. DATA VISUALIZATION TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const CHART = {
  // Bar colors by trend
  barUp: "var(--chart-2)",
  barDown: "var(--destructive)",
  barNeutral: "var(--chart-5)",
  // Area fill opacity
  areaFillOpacity: 0.15,
  areaFillOpacityActive: 0.25,
  // Stroke widths
  strokeWidth: 2,
  strokeWidthActive: 3,
  // Grid
  gridStroke: "var(--border)",
  gridDash: "3 3",
  // Tooltip
  tooltipBg: "var(--popover)",
  tooltipFg: "var(--popover-foreground)",
  tooltipBorder: "var(--border)",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  10. CANVAS & UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

export function cssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || ""
  );
}

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

export function mcHue(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function parseOklch(value: string): { l: number; c: number; h: number } | null {
  const m = value
    .trim()
    .match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

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
  if (hue != null && chroma != null) {
    return `oklch(${lightness ?? 0.65} ${chroma} ${hue})`;
  }
  if (!catId) return `oklch(${lightness ?? 0.65} 0 0)`;
  const cssValue = cssVar(`--${CATEGORY_COLOR[catId]}`);
  const parsed = parseOklch(cssValue);
  if (parsed) {
    const l = lightness ?? parsed.l;
    return `oklch(${l} ${parsed.c} ${parsed.h})`;
  }
  return `oklch(${lightness ?? 0.65} 0 0)`;
}

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

// ═══════════════════════════════════════════════════════════════════════════════
//  DESIGN_TOKENS — Structured single export for programmatic access
// ═══════════════════════════════════════════════════════════════════════════════

export const DESIGN_TOKENS = {
  color: {
    primitive: COLOR,
    category: CATEGORY_STYLES,
    uncategorized: UNCATEGORIZED_STYLE,
    trend: TREND,
    trendChip: TREND_CHIP,
    trendBg: TREND_BG,
    studio: STUDIO,
    valueAccent: VALUE_ACCENT,
    text: TEXT,
    bg: BG,
  },
  shape: {
    glass: GLASS,
    chip: CHIP,
    avatar: AVATAR,
    card: CARD,
    shadow: SHADOW,
    gradient: GRADIENT,
    radius: RADIUS,
  },
  selection: {
    checkbox: SELECTION_CHECKBOX,
  },
  space: {
    section: SECTION,
    sectionHeader: SECTION_HEADER,
    heading: HEADING,
    label: LABEL,
    statLabel: STAT_LABEL,
  },
  motion: {
    easing: EASING,
    duration: DURATION,
    fadeInUp: FADE_IN_UP,
    fadeIn: FADE_IN,
    scaleIn: SCALE_IN,
  },
  opacity: {
    overlay: OVERLAY,
    text: TEXT_OPACITY,
    border: BORDER_OPACITY,
    foreground: FG_OPACITY,
  },
  dimension: {
    aspect: ASPECT,
    maxHeight: MAX_HEIGHT,
    width: WIDTH,
    hero: HERO,
  },
  zIndex: Z_INDEX,
  dropShadow: DROP_SHADOW,
  chart: CHART,
  canvas: {
    cssVar,
    colors: canvasColors,
    mcHue,
    oklch,
    oklcha,
  },
} as const;
