"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Eye } from "lucide-react";
import { formatCurrency, formatFeeRange, formatNumber } from "@/lib/format";
import { getTierColor } from "@/lib/tier";
import { kolProfilePath } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useProfilePhoto } from "@/lib/profile-photo";
import type { Creator } from "@/lib/types/catalog";

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
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { imageUrl } = useProfilePhoto(kol);

  const primaryValue =
    kol.stats?.revenue > 0
      ? formatCurrency(kol.stats.revenue)
      : formatCurrency(kol.avgGMV || kol.avgLiveGMV);

  const initial = (kol.name?.[0] ?? kol.handle?.[0] ?? "?").toUpperCase();
  const displayImage = imageUrl && !imgError;

  return (
    <Link
      href={kolProfilePath(kol.id)}
      className="group relative block rounded-2xl overflow-hidden bg-muted aspect-[3/4]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile photo (stored or fetched from platform) or placeholder */}
      {displayImage ? (
        <Image
          src={imageUrl}
          alt={kol.name || kol.handle || "Creator"}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center",
            getPlatformGradient(kol.platform)
          )}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          <div className="size-16 rounded-full bg-foreground/10 border-2 border-foreground/20 flex items-center justify-center text-2xl font-bold text-foreground/70">
            {initial}
          </div>
        </div>
      )}

      {/* Bottom gradient — always visible for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        <span className="px-2 py-0.5 rounded-full bg-background/40 backdrop-blur-md text-foreground/80 text-[10px] font-semibold tracking-wide uppercase border border-foreground/10">
          {kol.platform}
        </span>
        <span
          className={cn(
            getTierColor(kol.tier),
            "text-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-lg"
          )}
        >
          {kol.tier?.replace(" KOL", "")}
        </span>
      </div>

      {/* Bottom info — always visible */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <p className="text-foreground font-semibold text-sm leading-tight truncate drop-shadow-lg">
          {kol.name || kol.handle}
        </p>
        <p className="text-foreground/50 text-xs leading-tight truncate font-mono">
          @{kol.handle}
        </p>
        {kol.location && (
          <p className="text-foreground/40 text-[10px] mt-0.5 flex items-center gap-0.5">
            <MapPin className="size-2.5" />
            {kol.location.split(",")[0]}
          </p>
        )}
      </div>

      {/* Hover overlay — stats */}
      <div
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          "group-focus-visible:opacity-100 group-focus-visible:pointer-events-auto"
        )}
      >
        <div className="text-center">
          <p className="text-foreground/50 text-[10px] uppercase tracking-wider font-medium">Followers</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">{formatNumber(kol.followers)}</p>
        </div>
        <div className="text-center">
          <p className="text-foreground/50 text-[10px] uppercase tracking-wider font-medium">Revenue</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">{primaryValue}</p>
        </div>
        <div className="text-center">
          <p className="text-foreground/50 text-[10px] uppercase tracking-wider font-medium">Engagement</p>
          <p className="text-foreground font-bold text-lg font-mono tabular-nums">
            {kol.engagementRate > 100 ? formatNumber(kol.engagementRate) : `${kol.engagementRate.toFixed(1)}%`}
          </p>
        </div>
        {kol.fees && (
          <p className="text-foreground/60 text-xs font-mono mt-1">
            {formatFeeRange(kol.fees)}
          </p>
        )}
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground/15 text-foreground text-xs font-medium mt-1 border border-foreground/10">
          <Eye className="size-3" />
          View profile
        </span>
      </div>
    </Link>
  );
}
