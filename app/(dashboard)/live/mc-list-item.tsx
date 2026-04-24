"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE } from "@/lib/design-tokens";
import type { LiveMC } from "@/lib/types/catalog";
import { Play, Briefcase } from "lucide-react";

interface MCListItemProps {
  mc: LiveMC;
  isSelected: boolean;
  isPlaying: boolean;
  hasVideo: boolean;
  isSelectionMode?: boolean;
  isChecked?: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onToggleCheck?: () => void;
}

function getInitials(handle: string): string {
  return handle.trim().charAt(0).toUpperCase() || "?";
}

function getFirstCategoryId(mc: LiveMC): ContentCategoryId | null {
  return (mc.contentCategories[0] as ContentCategoryId) ?? null;
}

export function MCListItem({
  mc,
  isSelected,
  isPlaying,
  hasVideo,
  isSelectionMode = false,
  isChecked = false,
  onSelect,
  onPlay,
  onToggleCheck,
}: MCListItemProps) {
  const [imgError, setImgError] = useState(false);
  const initial = getInitials(mc.handle);
  const firstCatId = getFirstCategoryId(mc);
  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;
  const previewUrl = mc.profilePhoto || mc.images[0]?.url;
  const hasPreview = !!previewUrl && !imgError;

  const handleClick = () => {
    if (isSelectionMode) onToggleCheck?.();
    else onSelect();
  };

  return (
    <div
      className={cn(
        "group relative block rounded-xl overflow-hidden bg-muted aspect-[3/4] cursor-pointer transition-all duration-200",
        isSelected && !isSelectionMode
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={handleClick}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className={cn(
            "absolute top-2 left-2 z-20 size-6 rounded-full border-2 flex items-center justify-center transition-all",
            isChecked
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-background/50 border-foreground/40 text-foreground/70 hover:bg-background/70"
          )}
        >
          {isChecked && (
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      )}

      {/* Cover image / video preview */}
      {hasPreview ? (
        <img
          src={previewUrl}
          alt={mc.handle}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-3xl font-black text-muted-foreground/30">{initial}</span>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent pointer-events-none" />

      {/* Category indicator dot (top-right) */}
      {firstCatId && (
        <div className="absolute top-2 right-2 z-10">
          <span className={cn("inline-block size-2.5 rounded-full border border-background/50", catStyle.dot)} />
        </div>
      )}

      {/* Play button */}
      {!isSelectionMode && hasVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90",
              isPlaying
                ? "bg-primary/80 border-primary/30 text-primary-foreground"
                : "bg-background/40 border-foreground/20 text-foreground"
            )}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <span className="relative flex size-2">
                <span className={cn("animate-ping absolute inline-flex size-full rounded-full opacity-75", catStyle.dot)} />
                <span className={cn("relative inline-flex rounded-full size-2", catStyle.dot)} />
              </span>
            ) : (
              <Play className="size-4 ml-0.5" />
            )}
          </div>
        </div>
      )}

      {/* Brand count badge */}
      {mc.brands.length > 0 && (
        <div className="absolute top-2 right-8 z-10">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/50 backdrop-blur-sm text-foreground/80 text-[10px] font-semibold border border-foreground/10">
            <Briefcase className="size-2" />
            {mc.brands.length}
          </span>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p className="text-foreground font-semibold text-sm leading-tight truncate">
          {mc.handle}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {mc.brands.slice(0, 2).map((brand) => (
            <span
              key={brand}
              className="px-1.5 py-0.5 rounded-md bg-background/60 backdrop-blur-sm text-[10px] text-foreground/80 font-medium truncate max-w-[80px]"
            >
              {brand}
            </span>
          ))}
          {mc.brands.length > 2 && (
            <span className="text-[10px] text-foreground/50 px-1">+{mc.brands.length - 2}</span>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && !isSelectionMode && (
        <div className={cn("absolute bottom-2 right-2 z-10 size-2 rounded-full", catStyle.dot)} />
      )}
    </div>
  );
}
