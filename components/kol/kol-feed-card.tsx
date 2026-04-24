"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Eye, Video, BarChart3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatFeeRange, formatNumber } from "@/lib/format";
import { getTierColor } from "@/lib/tier";
import { kolProfilePath } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { VALUE_ACCENT } from "@/lib/design-tokens";
import { useI18n } from "@/contexts/i18n-context";

import type { Creator } from "@/lib/types/catalog";

/* ── Platform-aware placeholder gradients ── */
const PLATFORM_GRADIENTS: Record<string, string> = {
  tiktok: "from-zinc-800 via-zinc-700 to-zinc-600",
  instagram: "from-purple-900 via-pink-800 to-orange-700",
  youtube: "from-red-900 via-red-800 to-rose-700",
  facebook: "from-blue-900 via-blue-800 to-indigo-700",
};

function getPlatformGradient(platform: string) {
  return PLATFORM_GRADIENTS[platform.toLowerCase()] ?? "from-slate-800 via-slate-700 to-slate-600";
}

/* ── Category tint for visual variety when no image ── */
const CATEGORY_TINTS: Record<string, { bg: string; text: string }> = {
  Beauty: { bg: "bg-pink-500/10", text: "text-pink-400" },
  Skincare: { bg: "bg-rose-500/10", text: "text-rose-400" },
  Fashion: { bg: "bg-violet-500/10", text: "text-violet-400" },
  Food: { bg: "bg-orange-500/10", text: "text-orange-400" },
  Health: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  Fitness: { bg: "bg-lime-500/10", text: "text-lime-400" },
  Tech: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Lifestyle: { bg: "bg-amber-500/10", text: "text-amber-400" },
  Mom: { bg: "bg-sky-500/10", text: "text-sky-400" },
  Travel: { bg: "bg-teal-500/10", text: "text-teal-400" },
};

function getCategoryTint(categories: string[]) {
  for (const cat of categories) {
    const tint = CATEGORY_TINTS[cat];
    if (tint) return tint;
  }
  return { bg: "bg-white/10", text: "text-white/60" };
}

/* ── Simple platform icon (text fallback) ── */
function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "tiktok")
    return (
      <svg viewBox="0 0 24 24" className="size-10 opacity-40" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.2 0 .39.02.57.06V9.66a6.24 6.24 0 00-.57-.03A6.36 6.36 0 003 16.04 6.36 6.36 0 009.36 22.4a6.36 6.36 0 006.36-6.36V9.03a8.35 8.35 0 004.83 1.54V7.12a4.85 4.85 0 01-1-.43z" />
      </svg>
    );
  if (p === "instagram")
    return (
      <svg viewBox="0 0 24 24" className="size-10 opacity-40" fill="currentColor">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.23.23 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.16 4.35 2.63 6.82 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.16 6.82-2.63 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95C23.77 2.7 21.3.23 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm7.85-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
      </svg>
    );
  if (p === "youtube")
    return (
      <svg viewBox="0 0 24 24" className="size-10 opacity-40" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.81zM9.55 15.5V8.5l6.27 3.5-6.27 3.5z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="size-10 opacity-40" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

const TYPE_ICON_COLORS = {
  live: "text-destructive",
  video: "text-chart-3",
  default: "text-muted-foreground",
};

interface KOLFeedCardProps {
  kol: Creator;
}

export function KOLFeedCard({ kol }: KOLFeedCardProps) {
  const { t } = useI18n();
  const [imgError, setImgError] = useState(false);

  const typeKey = kol.kolType?.toLowerCase().includes("live")
    ? "live"
    : kol.kolType?.toLowerCase().includes("video")
      ? "video"
      : "default";

  const typeIcon =
    typeKey === "live" ? (
      <Video className={cn("size-3", TYPE_ICON_COLORS.live)} />
    ) : typeKey === "video" ? (
      <Video className={cn("size-3", TYPE_ICON_COLORS.video)} />
    ) : (
      <BarChart3 className={cn("size-3", TYPE_ICON_COLORS.default)} />
    );

  const primaryValue =
    kol.stats?.revenue > 0
      ? formatCurrency(kol.stats.revenue)
      : formatCurrency(kol.avgGMV || kol.avgLiveGMV);

  const isRevenue = kol.stats?.revenue > 0;
  const primaryLabel = isRevenue
    ? t("kol.metrics.revenue.label")
    : t("kol.metrics.gmv.label");
  const primaryTooltip = isRevenue
    ? t("kol.metrics.revenue.tooltip")
    : t("kol.metrics.gmv.tooltip");

  const tint = useMemo(() => getCategoryTint(kol.categories), [kol.categories]);
  const initial = (kol.name?.[0] ?? kol.handle?.[0] ?? "?").toUpperCase();

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-border/20 bg-card hover:border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
      <Link
        href={kolProfilePath(kol.id)}
        className="relative block overflow-hidden aspect-[3/4] bg-muted"
      >
        {kol.image && !imgError ? (
          <Image
            src={kol.image}
            alt={kol.name || kol.handle || "Creator profile"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            sizes="(max-width: 640px) 85vw, (max-width: 768px) 46vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center gap-3",
              getPlatformGradient(kol.platform)
            )}
          >
            {/* Subtle dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            {/* Platform icon */}
            <div className="text-white/30">
              <PlatformIcon platform={kol.platform} />
            </div>
            {/* Initial badge with category tint */}
            <div
              className={cn(
                "relative flex items-center justify-center size-14 rounded-full border-2 border-white/20 text-xl font-bold",
                tint.bg,
                tint.text
              )}
            >
              {initial}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-semibold tracking-wide uppercase">
            {kol.platform}
          </span>
          <Badge
            className={cn(
              getTierColor(kol.tier),
              "text-white text-[10px] px-2 py-0.5 border-0 font-semibold shadow-lg"
            )}
          >
            {kol.tier}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-white font-semibold text-[15px] leading-tight truncate drop-shadow-lg">
            {kol.name || kol.handle}
          </p>
          <p className="text-white/50 text-xs leading-tight truncate font-mono">
            @{kol.handle}
          </p>
        </div>
      </Link>

      <div className="flex flex-col flex-1 justify-between px-3 py-2.5 gap-2">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <div className="flex items-center gap-1.5 text-muted-foreground overflow-hidden">
            {typeIcon}
            <span className="text-[11px] font-medium truncate">
              {kol.kolType?.replace(" Creator", "") || "Creator"}
            </span>
            {kol.location && (
              <span className="flex items-center gap-0.5 text-[10px] truncate ml-1">
                <MapPin className="size-2.5 shrink-0" />
                {kol.location.split(",")[0]}
              </span>
            )}
          </div>
          {kol.fees && (
            <span className={cn("text-[11px] font-mono font-bold shrink-0 tabular-nums", VALUE_ACCENT)}>
              {formatFeeRange(kol.fees)}
            </span>
          )}
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-3 divide-x divide-border/20 rounded-xl bg-muted/20 border border-border/10 py-2.5 sm:py-3">
            <MetricCol
              label={t("kol.metrics.followers.label")}
              value={formatNumber(kol.followers)}
              tooltip={t("kol.metrics.followers.tooltip")}
            />
            <MetricCol
              label={primaryLabel}
              value={primaryValue}
              highlight
              tooltip={primaryTooltip}
            />
            <MetricCol
              label={t("kol.metrics.engagement.label")}
              value={
                kol.engagementRate > 100
                  ? formatNumber(kol.engagementRate)
                  : `${kol.engagementRate.toFixed(1)}%`
              }
              tooltip={
                kol.engagementRate > 100
                  ? t("kol.metrics.engagement.tooltipHigh")
                  : t("kol.metrics.engagement.tooltip")
              }
            />
          </div>
        </TooltipProvider>

        <div className="flex gap-2 pt-0.5">
          <Link href={kolProfilePath(kol.id)} className="flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl text-xs font-medium gap-1.5 hover:bg-muted/50 transition-all duration-200 active:scale-[0.98]"
            >
              <Eye className="size-3.5 shrink-0" />
              <span className="truncate hidden sm:inline">{t("kol.actions.viewProfile")}</span>
              <span className="truncate sm:hidden">{t("kol.actions.view")}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCol({
  label,
  value,
  highlight,
  tooltip,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tooltip?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="text-center px-1 sm:px-2 min-w-0 cursor-help py-1">
          <p
            className={cn(
              "text-[11px] sm:text-[13px] font-mono font-bold leading-tight truncate tabular-nums tracking-tight",
              highlight ? "text-foreground" : "text-foreground/80"
            )}
          >
            {value}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-0.5">
            <span className="truncate max-w-[70px] sm:max-w-none">{label}</span>
            {tooltip && <Info className="size-2.5 opacity-40 shrink-0" />}
          </p>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="bottom" className="max-w-[200px] text-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
