"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE, CHIP, AVATAR } from "@/lib/design-tokens";
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
  index?: number;
}

function getInitials(handle: string): string {
  const first = handle.trim().charAt(0).toUpperCase();
  return first || "?";
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
  index = 0,
}: MCListItemProps) {
  const [imgError, setImgError] = useState(false);
  const initial = getInitials(mc.handle);
  const firstCatId = getFirstCategoryId(mc);
  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;
  const mainCategories = mc.contentCategories.slice(0, 2);
  const brandCount = mc.brands.length;
  const videoCount = mc.videos.length;
  const hasProfilePhoto = !!mc.profilePhoto && !imgError;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isSelectionMode) {
        onToggleCheck?.();
      } else {
        onSelect();
      }
    }
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleCheck?.();
    } else {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${mc.handle}, ${brandCount} brands, ${videoCount} videos`}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border transition-all duration-200 cursor-pointer outline-none overflow-hidden",
        isSelected && !isSelectionMode
          ? "bg-muted/60 border-transparent shadow-sm pl-5 pr-3.5 py-3"
          : "bg-muted/20 border-border/30 hover:border-border/60 hover:bg-muted/40 px-3.5 py-3"
      )}
      style={{
        animationDelay: `${Math.min(index * 30, 500)}ms`,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div
          className={cn(
            "shrink-0 size-5 rounded-md border-2 flex items-center justify-center transition-all",
            isChecked
              ? "bg-primary border-primary"
              : "bg-background/60 border-foreground/30 group-hover:border-foreground/50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
        >
          {isChecked && (
            <svg className="size-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}

      {/* Active indicator (non-selection mode) */}
      {!isSelectionMode && (
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          )}
          aria-hidden="true"
        >
          <div className={cn("size-full rounded-r-full", catStyle.dot)} />
        </div>
      )}

      {/* Avatar / Profile Photo */}
      <div
        className={cn(
          "relative shrink-0 size-12 rounded-xl overflow-hidden flex items-center justify-center text-sm font-semibold",
          hasProfilePhoto ? "" : cn(AVATAR.base, catStyle.avatarBg, catStyle.avatarBorder, catStyle.avatarText)
        )}
      >
        {hasProfilePhoto ? (
          <img
            src={mc.profilePhoto}
            alt={mc.handle}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <>
            {initial}
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 flex size-3">
                <span className={cn("animate-ping absolute inline-flex size-full rounded-full opacity-75", catStyle.dot)} />
                <span className={cn("relative inline-flex rounded-full size-3", catStyle.dot)} />
              </span>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {mc.handle}
          </h3>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          {brandCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="size-3" />
              {brandCount}
            </span>
          )}
          {videoCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {videoCount} video{videoCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Category chips — truncated to prevent wrapping */}
        {mainCategories.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {mainCategories.map((rawCatId) => {
              const catId = rawCatId as ContentCategoryId;
              const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
              const s = CATEGORY_STYLES[catId];
              if (!cat || !s) return null;
              return (
                <span
                  key={catId}
                  className={cn(
                    CHIP.base, CHIP.sm,
                    s.chipBg, s.chipBorder, s.chipText
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.dot)} />
                  <span className="truncate max-w-[80px]">{cat.label}</span>
                </span>
              );
            })}
            {mc.contentCategories.length > 2 && (
              <span className="text-2xs text-muted-foreground">
                +{mc.contentCategories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Play button */}
      {hasVideo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={cn(
            "shrink-0 size-8 rounded-full flex items-center justify-center transition-all duration-200",
            isPlaying
              ? cn(catStyle.playButtonBg, catStyle.playButtonText)
              : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40"
          )}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <span className="relative flex size-2">
              <span className={cn("animate-ping absolute inline-flex size-full rounded-full opacity-75", catStyle.dot)} />
              <span className={cn("relative inline-flex rounded-full size-2", catStyle.dot)} />
            </span>
          ) : (
            <Play className="size-3" />
          )}
        </button>
      )}
    </div>
  );
}
