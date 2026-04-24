"use client";

import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES } from "@/lib/design-tokens";
import type { LiveMC } from "@/lib/types/catalog";
import { Play, Briefcase } from "lucide-react";

interface MCListItemProps {
  mc: LiveMC;
  isSelected: boolean;
  isPlaying: boolean;
  hasVideo: boolean;
  onSelect: () => void;
  onPlay: () => void;
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
  onSelect,
  onPlay,
  index = 0,
}: MCListItemProps) {
  const initial = getInitials(mc.handle);
  const firstCatId = getFirstCategoryId(mc);
  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : null;
  const mainCategories = mc.contentCategories.slice(0, 3);
  const brandCount = mc.brands.length;
  const videoCount = mc.videos.length;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer",
        "hover:bg-muted/60 hover:border-border/80",
        isSelected
          ? "bg-muted border-l-4 border-l-primary border-border shadow-sm"
          : "bg-card border-border border-l-4 border-l-transparent"
      )}
      style={{
        animationDelay: `${Math.min(index * 30, 500)}ms`,
      }}
      onClick={onSelect}
    >
      {/* Avatar */}
      <div
        className={cn(
          "relative shrink-0 size-11 rounded-xl flex items-center justify-center border text-sm font-bold transition-transform duration-200 overflow-hidden",
          "group-hover:scale-105",
          mc.image
            ? "bg-muted"
            : catStyle
              ? [catStyle.avatarBg, catStyle.avatarBorder, catStyle.avatarText]
              : "bg-muted border-border text-muted-foreground"
        )}
      >
        {mc.image ? (
          <img
            src={mc.image}
            alt={mc.handle}
            className="size-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.textContent = initial;
                target.parentElement.classList.add(
                  catStyle?.avatarBg ?? "bg-muted",
                  catStyle?.avatarText ?? "text-muted-foreground"
                );
              }
            }}
          />
        ) : (
          initial
        )}
        {isPlaying && catStyle && (
          <span className="absolute -top-0.5 -right-0.5 flex size-3">
            <span className={cn("animate-ping absolute inline-flex size-full rounded-full opacity-75", catStyle.dot)} />
            <span className={cn("relative inline-flex rounded-full size-3", catStyle.dot)} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {mc.handle}
          </h3>
          {hasVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className={cn(
                "shrink-0 size-6 rounded-full flex items-center justify-center transition-colors",
                isPlaying
                  ? "bg-chart-2/15 text-chart-2"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              <Play className="size-3" />
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          {brandCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Briefcase className="size-3" />
              {brandCount} {brandCount === 1 ? "brand" : "brands"}
            </span>
          )}
          {videoCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {videoCount} {videoCount === 1 ? "video" : "videos"}
            </span>
          )}
        </div>

        {/* Category dots */}
        {mainCategories.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {mainCategories.map((rawCatId) => {
              const catId = rawCatId as ContentCategoryId;
              const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
              const s = CATEGORY_STYLES[catId];
              if (!cat || !s) return null;
              return (
                <span
                  key={catId}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
                    s.chipBg, s.chipBorder, s.chipText
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.dot)} />
                  {cat.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      <div
        className={cn(
          "shrink-0 size-4 rounded-full border-2 transition-all duration-200",
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
        )}
      >
        {isSelected && (
          <svg
            className="size-full text-primary-foreground p-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
