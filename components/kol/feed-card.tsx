"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Eye } from "lucide-react";
import { formatCurrency, formatFeeRange, formatNumber } from "@/lib/format";
import { getTierColor } from "@/lib/constants";
import { kolProfilePath } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { ASPECT, DURATION, OVERLAY, TEXT_OPACITY, FG_OPACITY, SHADOW, RADIUS, DROP_SHADOW } from "@/lib/design-tokens";
import type { Creator } from "@/lib/types";

/* ── Platform-aware placeholder gradients ── */
const PLATFORM_GRADIENTS: Record<string, string> = {
  tiktok: "from-muted via-muted-foreground/30 to-muted-foreground/20",
  instagram: "from-chart-4 via-chart-3 to-chart-1",
  youtube: "from-destructive via-destructive/70 to-chart-1",
  facebook: "from-chart-2 via-chart-3 to-primary",
};

function getPlatformGradient(platform: string) {
  return PLATFORM_GRADIENTS[platform.toLowerCase()] ?? "from-muted via-muted-foreground/30 to-muted-foreground/20";
}

interface KOLFeedCardProps {
  kol: Creator;
}

export function KOLFeedCard({ kol }: KOLFeedCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const primaryValue =
    kol.stats?.revenue > 0
      ? formatCurrency(kol.stats.revenue)
      : formatCurrency(kol.avgGMV ?? kol.avgLiveGMV);

  const initial = (kol.name?.[0] ?? kol.handle?.[0] ?? "?").toUpperCase();
  const hasImage = kol.image && !imgError;

  return (
    <Link
      href={kolProfilePath(kol.id)}
      className={`group relative block ${RADIUS.xl} overflow-hidden bg-muted ${ASPECT.portrait}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image or gradient placeholder */}
      {hasImage ? (
        <img
          src={kol.image}
          alt={kol.name || kol.handle}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center",
            getPlatformGradient(kol.platform)
          )}
        >
          <div
            className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,hsl(var(--foreground))_1px,transparent_1px)] bg-[length:20px_20px]"
          />
          <div className={`size-14 ${RADIUS.full} ${FG_OPACITY.subtle} border border-foreground/15 flex items-center justify-center text-xl font-bold ${TEXT_OPACITY.muted}`}>
            {initial}
          </div>
        </div>
      )}

      {/* Bottom gradient — always visible for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        <span className={`px-2 py-0.5 ${RADIUS.full} ${OVERLAY.light} backdrop-blur-md text-foreground/80 text-2xs font-semibold tracking-wide uppercase border border-foreground/10`}>
          {kol.platform}
        </span>
        <span
          className={cn(
            getTierColor(kol.tier),
            `text-black text-2xs px-2 py-0.5 rounded-full font-semibold ${SHADOW.lg}`
          )}
        >
          {kol.tier?.replace(" KOL", "")}
        </span>
      </div>

      {/* Bottom info — always visible */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <p className={`text-foreground font-semibold text-sm leading-tight truncate ${DROP_SHADOW.lg}`}>
          {kol.name || kol.handle}
        </p>
        <p className={`${TEXT_OPACITY.dim} text-xs leading-tight truncate font-mono`}>
          @{kol.handle}
        </p>
        {kol.location && (
          <p className="text-foreground/40 text-2xs mt-0.5 flex items-center gap-0.5">
            <MapPin className="size-2.5" />
            {kol.location.split(",")[0]}
          </p>
        )}
      </div>

      {/* Hover overlay — stats */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 transition-opacity",
          OVERLAY.heavy,
          DURATION.normal,
          `motion-safe:${DURATION.normal}`,
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          "group-focus-visible:opacity-100 group-focus-visible:pointer-events-auto"
        )}
      >
        <div className="text-center">
          <p className={`${TEXT_OPACITY.dim} text-2xs uppercase tracking-wider font-medium`}>Followers</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">{formatNumber(kol.followers)}</p>
        </div>
        <div className="text-center">
          <p className={`${TEXT_OPACITY.dim} text-2xs uppercase tracking-wider font-medium`}>Revenue</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">{primaryValue}</p>
        </div>
        <div className="text-center">
          <p className={`${TEXT_OPACITY.dim} text-2xs uppercase tracking-wider font-medium`}>Engagement</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">
            {kol.engagementRate > 100 ? formatNumber(kol.engagementRate) : `${kol.engagementRate.toFixed(1)}%`}
          </p>
        </div>
        {kol.fees && (
          <p className={`${TEXT_OPACITY.muted} text-xs font-mono mt-1`}>
            {formatFeeRange(kol.fees)}
          </p>
        )}
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 ${RADIUS.full} bg-foreground/15 text-foreground text-xs font-medium mt-1 border border-foreground/10`}>
          <Eye className="size-3" />
          View profile
        </span>
      </div>
    </Link>
  );
}
