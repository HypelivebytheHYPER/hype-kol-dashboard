"use client";

import { cn } from "@/lib/cn";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE, DURATION, OVERLAY, TEXT_OPACITY } from "@/lib/design-tokens";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import type { LiveMC } from "@/lib/types/catalog";
import { Play, Briefcase, Check } from "lucide-react";
import { useState } from "react";

interface MCCardProps {
  mc: LiveMC;
  isSelected: boolean;
  isPlaying: boolean;
  isSelectionMode?: boolean;
  isChecked?: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onToggleCheck?: () => void;
}

function getFirstCategoryId(mc: LiveMC): ContentCategoryId | null {
  return (mc.contentCategories[0] as ContentCategoryId) ?? null;
}

export function MCCard({ mc, isSelected, isPlaying, isSelectionMode = false, isChecked = false, onSelect, onPlay, onToggleCheck }: MCCardProps) {
  const [imgError, setImgError] = useState(false);
  const firstCatId = getFirstCategoryId(mc);
  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;
  const firstVideo = mc.videos[0];
  const hasVideo = !!firstVideo;
  const hasPhoto = !!mc.profilePhoto && !imgError;

  return (
    <div
      className={cn(
        "group relative block w-full rounded-2xl overflow-hidden bg-muted aspect-[9/16] max-h-[480px] text-left transition-all duration-200",
        isSelected && !isSelectionMode
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {/* Selection checkbox overlay */}
      {isSelectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className={cn(
            "absolute top-3 left-3 z-20 size-6 rounded-full border-2 flex items-center justify-center transition-all",
            isChecked
              ? "bg-primary border-primary text-primary-foreground"
              : `${OVERLAY.light} border-foreground/50 text-foreground/70 hover:bg-background/60`
          )}
        >
          {isChecked && <Check className="size-3.5" />}
        </button>
      )}

      {/* Main card click area */}
      <button onClick={isSelectionMode ? onToggleCheck ?? onSelect : onSelect} className="block w-full h-full">
        {/* Video or profile photo background */}
        {hasVideo ? (
          <video
            src={firstVideo.url}
            preload="metadata"
            muted
            playsInline
            className={`absolute inset-0 size-full object-cover transition-transform ${DURATION.slow} group-hover:scale-[1.04]`}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) v.currentTime = Math.min(0.5, v.duration * 0.1);
            }}
          />
        ) : hasPhoto ? (
          <img
            src={mc.profilePhoto}
            alt={mc.handle}
            className={`absolute inset-0 size-full object-cover transition-transform ${DURATION.slow} group-hover:scale-[1.04]`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />

        {/* Play button — visible on hover or when playing */}
        {!isSelectionMode && (isPlaying || !isSelected) && hasVideo && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity ${DURATION.normal}`}>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onPlay();
                }
              }}
              className={cn(
                "size-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90 cursor-pointer",
                isPlaying
                  ? "bg-primary/80 border-primary/30 text-primary-foreground"
                  : `${OVERLAY.light} border-foreground/20 text-foreground`
              )}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              <Play className="size-5 ml-0.5" />
            </div>
          </div>
        )}

        {/* Top-right: brand count */}
        {mc.brands.length > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${OVERLAY.light} backdrop-blur-md text-foreground/80 text-2xs font-semibold border border-foreground/10`}>
              <Briefcase className="size-2.5" />
              {mc.brands.length}
            </span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-foreground font-semibold text-sm leading-tight truncate drop-shadow-lg">
            {mc.handle}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {mc.contentCategories.slice(0, 2).map((rawCatId) => {
              const catId = rawCatId as ContentCategoryId;
              const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
              const s = CATEGORY_STYLES[catId];
              if (!cat || !s) return null;
              return (
                <span
                  key={catId}
                  className={cn(
                    "px-1.5 py-0.5 rounded-md text-2xs font-medium",
                    s.chipBg, s.chipText
                  )}
                >
                  {cat.label}
                </span>
              );
            })}
            {mc.contentCategories.length > 2 && (
              <span className={`text-2xs ${TEXT_OPACITY.dim} px-1`}>+{mc.contentCategories.length - 2}</span>
            )}
          </div>
        </div>
      </button>

      {/* Selected indicator (non-selection mode) */}
      {isSelected && !isSelectionMode && (
        <div className={cn("absolute top-3 left-3 z-10 size-2.5 rounded-full", catStyle.dot)} />
      )}
    </div>
  );
}
