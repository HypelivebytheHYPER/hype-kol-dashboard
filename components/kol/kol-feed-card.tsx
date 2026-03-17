"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Eye, Radio, Video, BarChart3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber, formatCurrency, getTierColor } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";
import { SelectionCheckbox } from "@/components/selection/floating-selection-bar";
import { KOLContactEditor } from "@/components/kol/kol-contact-editor";
import { ScoreGauge } from "@/components/ui/score-gauge";
import type { ApiKOL } from "@/lib/lark-api";
import { getKOLImageUrl } from "@/lib/lark-api";

const TIER_BASE_RATE: Record<string, number> = {
  "Nano KOL": 5000,
  "Micro KOL": 25000,
  "Mid-tier": 80000,
  "Macro KOL": 250000,
  "Mega KOL": 800000,
};

/* ── Platform icons ── */
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function getPlatformGradient(p: string) {
  const pl = p.toLowerCase();
  if (pl.includes("tiktok")) return "from-zinc-900 to-zinc-700";
  if (pl.includes("instagram")) return "from-purple-800 via-pink-700 to-orange-500";
  if (pl.includes("youtube")) return "from-red-900 to-red-700";
  if (pl.includes("facebook")) return "from-blue-900 to-blue-700";
  return "from-slate-900 to-slate-700";
}

function getSocialUrls(kol: ApiKOL) {
  const out: { platform: string; url: string; icon: React.ReactNode }[] = [];
  const u = ((kol as unknown as Record<string, unknown>).urls || {}) as Record<string, string>;
  if (kol.channel?.includes("tiktok.com"))
    out.push({ platform: "TikTok", url: kol.channel, icon: <TikTokIcon className="w-4 h-4" /> });
  if (u.tiktok && !out.some((x) => x.platform === "TikTok"))
    out.push({ platform: "TikTok", url: u.tiktok, icon: <TikTokIcon className="w-4 h-4" /> });
  if (u.instagram)
    out.push({
      platform: "Instagram",
      url: u.instagram,
      icon: <InstagramIcon className="w-4 h-4" />,
    });
  if (u.youtube)
    out.push({ platform: "YouTube", url: u.youtube, icon: <YouTubeIcon className="w-4 h-4" /> });
  if (u.facebook)
    out.push({ platform: "Facebook", url: u.facebook, icon: <FacebookIcon className="w-4 h-4" /> });
  return out;
}

interface KOLFeedCardProps {
  kol: ApiKOL & { computedImageUrl?: string };
  index?: number;
  priority?: boolean;
}

export function KOLFeedCard({ kol, index = 0, priority = false }: KOLFeedCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { t, locale } = useI18n();
  // computedImageUrl from worker is a relative path like /api/image/TOKEN — must be resolved via getKOLImageUrl
  const imageUrl = getKOLImageUrl({
    imageUrl: kol.computedImageUrl || kol.imageUrl,
    handle: kol.handle,
    platform: kol.platform,
  });
  const hasImage = !!imageUrl && !imgErr;
  const socials = getSocialUrls(kol);
  const rate = TIER_BASE_RATE[kol.tier] || 0;

  const typeIcon = kol.kolType?.toLowerCase().includes("live") ? (
    <Radio className="w-3 h-3 text-red-400" />
  ) : kol.kolType?.toLowerCase().includes("video") ? (
    <Video className="w-3 h-3 text-blue-400" />
  ) : (
    <BarChart3 className="w-3 h-3 text-violet-400" />
  );

  const primaryValue =
    kol.stats?.revenue > 0
      ? formatCurrency(kol.stats.revenue)
      : formatCurrency(kol.avgGMV || kol.avgLiveGMV);
  const primaryLabel =
    kol.stats?.revenue > 0 ? t("kol.metrics.revenue.label") : t("kol.metrics.gmv.label");
  const viewsValue = kol.stats?.views > 0 ? formatNumber(kol.stats.views) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.08) }}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-border hover:shadow-xl transition-all duration-300"
    >
      {/* ══ IMAGE SECTION ══ */}
      <Link
        href={`/kols/${kol.id}`}
        className="relative block overflow-hidden aspect-[4/5] sm:aspect-[4/5] bg-muted"
      >
        {hasImage ? (
          <>
            {/* Skeleton placeholder - shown until image loads */}
            {!imgLoaded && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getPlatformGradient(kol.platform)} animate-pulse`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[48px] sm:text-[72px] font-black text-white/30 select-none">
                  {kol.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 group-hover:scale-[1.02] transition-transform duration-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={kol.name}
                width={400}
                height={500}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
                fetchPriority={priority ? "high" : "auto"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                className={`w-full h-full object-cover object-top transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onError={() => setImgErr(true)}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getPlatformGradient(kol.platform)}`}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[48px] sm:text-[72px] font-black text-white/30 select-none">
              {kol.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/70 text-white/90 text-[10px] font-semibold tracking-wide">
            {kol.platform}
          </span>
          <Badge
            className={`${getTierColor(kol.tier)} text-white text-[10px] px-2 py-0.5 border-0 font-semibold`}
          >
            {kol.tier}
          </Badge>
        </div>

        {/* Live indicator */}
        {kol.isLiveNow && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-10 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold"
            aria-live="polite"
            role="status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
            LIVE
          </motion.span>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-white font-bold text-[15px] leading-tight truncate drop-shadow-lg">
            {kol.name || kol.handle}
          </p>
          <p className="text-white/60 text-[12px] leading-tight truncate">@{kol.handle}</p>
        </div>
      </Link>

      {/* ══ DETAILS SECTION ══ */}
      <div className="flex flex-col flex-1 justify-between px-3 py-3 gap-2.5">
        {/* Type · Location · Rate */}
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
          {rate > 0 && (
            <span className="text-[11px] font-mono font-bold text-emerald-500 shrink-0 tabular-nums">
              ~{formatCurrency(rate)}
            </span>
          )}
        </div>

        {/* 3-col metrics - responsive text sizes */}
        <TooltipProvider>
          <div className="grid grid-cols-3 divide-x divide-border/50 rounded-xl bg-muted/30 py-2.5 sm:py-3">
            <MetricCol
              label={t("kol.metrics.followers.label")}
              value={formatNumber(kol.followers)}
              tooltip={t("kol.metrics.followers.tooltip")}
            />
            <MetricCol
              label={primaryLabel}
              value={primaryValue}
              highlight
              tooltip={
                primaryLabel === "Revenue"
                  ? t("kol.metrics.revenue.tooltip")
                  : t("kol.metrics.gmv.tooltip")
              }
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

        {/* Secondary metrics row - always 4 columns for alignment */}
        <div className="grid grid-cols-4 items-start gap-1">
          {/* Views */}
          <div className="flex justify-center">
            {viewsValue ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-[28px] sm:h-[32px] flex items-center justify-center">
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
              <div className="h-[44px] sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          {/* Quality Score */}
          <div className="flex justify-center">
            {kol.qualityScore > 0 ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-[28px] sm:h-[32px] flex items-center justify-center">
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
              <div className="h-[44px] sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          {/* Content Count */}
          <div className="flex justify-center">
            {kol.stats?.liveNum > 0 || kol.stats?.videoNum > 0 ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center cursor-help min-w-[40px] sm:min-w-[50px] pt-1">
                    <div className="h-[28px] sm:h-[32px] flex items-center justify-center">
                      <span className="text-[11px] sm:text-[13px] font-mono font-bold tabular-nums leading-none text-foreground">
                        {kol.stats?.liveNum || 0}·{kol.stats?.videoNum || 0}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                      {locale === "th"
                        ? `${t("kol.metrics.contentOutput.live")}·${t("kol.metrics.contentOutput.video")}`
                        : "Content"}
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
              <div className="h-[44px] sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>

          {/* Category */}
          <div className="flex justify-center">
            {kol.categories?.[0] ? (
              <div className="h-[44px] sm:h-[52px] min-w-[40px] sm:min-w-[50px] pt-1">
                <div className="h-[28px] sm:h-[32px] flex items-center justify-center">
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full truncate font-normal max-w-[60px] sm:max-w-[80px]"
                  >
                    {kol.categories[0]}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-[44px] sm:h-[52px] min-w-[40px] sm:min-w-[50px]" />
            )}
          </div>
        </div>

        {/* Contact editor - inline editing support */}
        <KOLContactEditor
          kol={kol}
          onSave={(updated) => {
            // TODO: API call to update contact info
            // Contact update handled by parent component
            void updated;
          }}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link href={`/kols/${kol.id}`} className="flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl text-xs font-medium gap-1.5 hover:bg-muted"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate hidden xs:inline">{t("kol.actions.viewProfile")}</span>
              <span className="truncate xs:hidden">{t("kol.actions.view")}</span>
            </Button>
          </Link>
          <motion.div
            className="flex items-center gap-2 px-2 sm:px-3 h-9 rounded-xl border bg-background cursor-pointer shrink-0"
            whileHover={{ scale: 1.02, borderColor: "var(--primary)" }}
            whileTap={{ scale: 0.98 }}
          >
            <SelectionCheckbox kol={kol} />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t("kol.actions.select")}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Sub-components ── */

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
            className={`text-[11px] sm:text-[13px] font-mono font-bold leading-tight truncate tabular-nums ${
              highlight ? "text-foreground" : "text-foreground opacity-80"
            }`}
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
