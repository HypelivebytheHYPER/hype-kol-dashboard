"use client";

import Link from "next/link";
import { MapPin, Eye, Video, BarChart3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatFeeRange, formatNumber } from "@/lib/format";
import { getTierColor } from "@/lib/tier";
import { kolProfilePath } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useI18n } from "@/contexts/i18n-context";
import { ScoreGauge } from "@/components/ui/score-gauge";
import type { Creator } from "@/lib/types/catalog";

const PLATFORM_GRADIENTS: Record<string, string> = {
  tiktok: "from-zinc-800 to-zinc-600",
  instagram: "from-purple-900 via-pink-800 to-orange-600",
  youtube: "from-red-900 to-red-700",
  facebook: "from-blue-900 to-blue-700",
};

function getPlatformGradient(platform: string) {
  return PLATFORM_GRADIENTS[platform.toLowerCase()] ?? "from-slate-800 to-slate-600";
}

const TYPE_ICON_COLORS = {
  live: "text-red-400",
  video: "text-blue-400",
  default: "text-violet-400",
};

interface KOLFeedCardProps {
  kol: Creator;
}

export function KOLFeedCard({ kol }: KOLFeedCardProps) {
  const { t } = useI18n();

  const typeKey = kol.kolType?.toLowerCase().includes("live")
    ? "live"
    : kol.kolType?.toLowerCase().includes("video")
      ? "video"
      : "default";

  const typeIcon =
    typeKey === "live" ? (
      <Video className={cn("w-3 h-3", TYPE_ICON_COLORS.live)} />
    ) : typeKey === "video" ? (
      <Video className={cn("w-3 h-3", TYPE_ICON_COLORS.video)} />
    ) : (
      <BarChart3 className={cn("w-3 h-3", TYPE_ICON_COLORS.default)} />
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

  const viewsValue = kol.stats?.views > 0 ? formatNumber(kol.stats.views) : null;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-border/20 bg-card hover:border-border/50 hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <Link
        href={kolProfilePath(kol.id)}
        className="relative block overflow-hidden aspect-[4/5] sm:aspect-[4/5] bg-muted"
      >
        {kol.image ? (
          <img
            src={kol.image}
            alt={kol.name || kol.handle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              getPlatformGradient(kol.platform)
            )}
          >
            <span className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl font-black text-white/20 select-none">
              {kol.name?.[0]?.toUpperCase() ?? "?"}
            </span>
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

      <div className="flex flex-col flex-1 justify-between px-3 py-3 gap-2.5">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <div className="flex items-center gap-1.5 text-muted-foreground overflow-hidden">
            {typeIcon}
            <span className="text-[11px] font-medium truncate">
              {kol.kolType?.replace(" Creator", "") || "Creator"}
            </span>
            {kol.location && (
              <span className="flex items-center gap-0.5 text-[10px] truncate ml-1">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                {kol.location.split(",")[0]}
              </span>
            )}
          </div>
          {kol.fees && (
            <span className="text-[11px] font-mono font-bold text-chart-4 shrink-0 tabular-nums">
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

        <div className="grid grid-cols-4 items-start gap-1">
          <div className="flex justify-center">
            {viewsValue ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-7 sm:h-8 flex items-center justify-center">
                      <span className="text-[11px] sm:text-[13px] font-mono font-bold tabular-nums leading-none truncate max-w-full px-1 text-foreground">
                        {viewsValue}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                      {t("kol.metrics.views.label")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {t("kol.metrics.views.tooltip")}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-11 sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          <div className="flex justify-center">
            {kol.qualityScore > 0 ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-7 sm:h-8 flex items-center justify-center">
                      <ScoreGauge score={kol.qualityScore} size={28} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                      {t("kol.metrics.qualityScore.label")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  <p className="font-medium mb-1">{t("kol.metrics.qualityScore.tooltip")}</p>
                  <p className="text-muted-foreground">
                    {kol.qualityScore >= 4.5
                      ? t("kol.metrics.qualityScore.excellent")
                      : kol.qualityScore >= 3.5
                        ? t("kol.metrics.qualityScore.good")
                        : kol.qualityScore >= 2.5
                          ? t("kol.metrics.qualityScore.average")
                          : t("kol.metrics.qualityScore.belowAverage")}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-11 sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          <div className="flex justify-center">
            {kol.stats?.liveNum > 0 || kol.stats?.videoNum > 0 ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-7 sm:h-8 flex items-center justify-center">
                      <span className="text-[11px] sm:text-[13px] font-mono font-bold tabular-nums leading-none text-foreground">
                        {kol.stats?.liveNum || 0}·{kol.stats?.videoNum || 0}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                      {`${t("kol.metrics.contentOutput.live")}·${t("kol.metrics.contentOutput.video")}`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {t("kol.metrics.contentOutput.tooltip", {
                    liveNum: kol.stats?.liveNum || 0,
                    videoNum: kol.stats?.videoNum || 0,
                  })}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-11 sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          <div className="flex justify-center">
            {kol.categories?.[0] ? (
              <div className="h-11 sm:h-[52px] min-w-[40px] sm:min-w-[50px] pt-1">
                <div className="h-7 sm:h-8 flex items-center justify-center">
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full truncate font-normal max-w-[60px] sm:max-w-[80px] border-border/20"
                  >
                    {kol.categories[0]}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-11 sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Link href={kolProfilePath(kol.id)} className="flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl text-xs font-medium gap-1.5 hover:bg-muted/50 transition-all duration-200"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate hidden xs:inline">{t("kol.actions.viewProfile")}</span>
              <span className="truncate xs:hidden">{t("kol.actions.view")}</span>
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
            <span className="truncate max-w-[50px] sm:max-w-none">{label}</span>
            {tooltip && <Info className="w-2.5 h-2.5 opacity-40 shrink-0" />}
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
