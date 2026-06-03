"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import {
  SELECTION_CHECKBOX,
  CATEGORY_STYLES,
  UNCATEGORIZED_STYLE,
  DURATION,
  OVERLAY,
  RING,
  ELEVATION,
  PLAY_BUTTON,
  MEDIA,
  BADGE,
  TEXT,
  MAX_HEIGHT,
  GLASS,
  CHIP,
  Z_INDEX,
  RADIUS,
  DROP_SHADOW,
  ASPECT,
  SCALE,
} from "@/lib/design-tokens";
import { MAX_CATEGORY_BADGES } from "@/lib/constants";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import type { LiveMC } from "@/lib/types";
import {
  Play,
  Pause,
  Briefcase,
  Check,
  Volume2,
  VolumeX,
  Loader2,
  Video,
} from "lucide-react";

// ── MCCard ──────────────────────────────────────────────────────

interface MCCardProps {
  mc: LiveMC;
  isSelected: boolean;
  isPlaying: boolean;
  isSelectionMode?: boolean;
  isChecked?: boolean;
  className?: string;
  onSelect: () => void;
  onPlay: () => void;
  onToggleCheck?: () => void;
}

function getFirstCategoryId(mc: LiveMC): ContentCategoryId | null {
  return (mc.contentCategories[0] as ContentCategoryId) ?? null;
}

export function MCCard({
  mc,
  isSelected,
  isPlaying,
  isSelectionMode = false,
  isChecked = false,
  className,
  onSelect,
  onPlay,
  onToggleCheck,
}: MCCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const firstCatId = getFirstCategoryId(mc);
  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;
  const video = mc.videos.find((v) => v.url);
  const hasVideo = !!video;

  // Lazy-load video metadata only when card enters viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !hasVideo) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasVideo]);

  // Actually load video metadata when card scrolls into view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo || !inView) return;
    video.load();
  }, [inView, hasVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;
    if (isPlaying) {
      video.play().catch(() => {
        // Autoplay may be blocked by browser policy; silently ignore
      });
    } else {
      video.pause();
    }
  }, [isPlaying, hasVideo, video?.url]);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={isSelectionMode ? -1 : 0}
      aria-pressed={isSelected && !isSelectionMode ? true : undefined}
      onKeyDown={(e) => {
        if (isSelectionMode) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        `group relative block w-full ${RADIUS.xl} overflow-hidden bg-muted ${ASPECT.video} text-left transition-all ${DURATION.moderate}`,
        isSelected && !isSelectionMode ? RING.selected : ELEVATION.hover,
        className
      )}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className={cn(
            "top-3 left-3",
            SELECTION_CHECKBOX.base,
            isChecked ? SELECTION_CHECKBOX.checked : SELECTION_CHECKBOX.unchecked
          )}
        >
          {isChecked && <Check className="size-3.5" />}
        </button>
      )}

      {/* Media layer — video only */}
      {video && (
        <video
          ref={videoRef}
          src={video.url}
          preload={inView ? "metadata" : "none"}
          muted
          playsInline
          className={`${MEDIA.cover} ${Z_INDEX.base} transition-transform ${DURATION.slow} group-hover:${SCALE.hover}`}
          onClick={isSelectionMode ? undefined : onSelect}
        />
      )}

      {/* Gradient overlay — between base media and content controls */}
      <div className={`absolute inset-0 ${Z_INDEX.gradient} bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none`} />

      {/* Play button */}
      {!isSelectionMode && hasVideo && (isPlaying || !isSelected) && (
        <div className={`${PLAY_BUTTON.wrapper} ${DURATION.normal} ${Z_INDEX.content}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className={cn(
              "size-12 cursor-pointer",
              PLAY_BUTTON.base,
              isPlaying ? PLAY_BUTTON.active : PLAY_BUTTON.inactive
            )}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
          </button>
        </div>
      )}

      {/* Brand count badge */}
      {mc.brands.length > 0 && (
        <div className={`absolute top-3 right-3 ${Z_INDEX.content}`}>
          <span className={`${BADGE.glass} px-2 py-0.5 ${OVERLAY.light}`}>
            <Briefcase className="size-2.5" />
            {mc.brands.length}
          </span>
        </div>
      )}

      {/* Bottom info — clickable for selection */}
      <div className={`absolute bottom-3 left-3 right-3 ${Z_INDEX.content}`} onClick={isSelectionMode ? undefined : onSelect}>
        <p className={`${TEXT.cardTitle} ${DROP_SHADOW.lg}`}>{mc.handle}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {mc.contentCategories.slice(0, MAX_CATEGORY_BADGES).map((rawCatId) => {
            const catId = rawCatId as ContentCategoryId;
            const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
            const s = CATEGORY_STYLES[catId];
            if (!cat || !s) return null;
            return (
              <span
                key={catId}
                className={cn(`px-1.5 py-0.5 ${RADIUS.sm} text-2xs font-medium`, s.chipBg, s.chipText)}
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

      {/* Selected indicator */}
      {isSelected && !isSelectionMode && (
        <div className={cn(`absolute top-3 left-3 ${Z_INDEX.content} size-2.5 ${RADIUS.full}`, catStyle.dot)} />
      )}
    </div>
  );
}

// ── MCDetailPanel ───────────────────────────────────────────────

interface MCDetailPanelProps {
  mc: LiveMC;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}

export function MCDetailPanel({
  mc,
  isPlaying,
  onTogglePlay,
  onClose: _onClose,
}: MCDetailPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);

  const video = mc.videos.find((v) => v.url);
  const hasVideo = !!video;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasVideo) return;

    if (isPlaying) {
      setLoading(v.readyState < 3);
      v.play().catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {
          // Muted autoplay also blocked; silently ignore
        });
      });
    } else {
      v.pause();
      v.currentTime = 0;
      setMuted(true);
    }
  }, [isPlaying, hasVideo, video?.url]);

  const glassBtn = cn(`size-9 ${RADIUS.full} flex items-center justify-center`, GLASS.base, GLASS.hover);

  return (
    <div className="flex flex-col animate-scale-in">
      {/* Media Player Area */}
      <div className={`${RADIUS["2xl"]} overflow-hidden bg-muted/40 border border-border/40 mb-8`}>
        <div className="relative flex items-center justify-center overflow-hidden">
          {video && (
            <video
              key={video.url}
              ref={videoRef}
              src={video.url}
              preload="metadata"
              playsInline
              loop
              onLoadedData={() => setLoading(false)}
              onError={() => setLoading(false)}
              className={`${MAX_HEIGHT.videoPlayer} max-w-full object-contain ${ASPECT.video} ${Z_INDEX.base}`}
            />
          )}
          {/* Loading overlay */}
          {isPlaying && loading && video && (
            <div className={cn(`absolute inset-0 flex items-center justify-center ${Z_INDEX.overlay} backdrop-blur-sm`, OVERLAY.light)}>
              <Loader2 className="size-8 text-foreground animate-spin" />
            </div>
          )}

          {/* Media controls + badge */}
          {!video && (
            <div className={`flex flex-col items-center justify-center ${ASPECT.video} ${MAX_HEIGHT.videoPlayer} w-full py-20`}>
              <Video className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No video available</p>
            </div>
          )}
          {video && (
            <div className={`absolute inset-0 ${Z_INDEX.controls} pointer-events-none`}>
              <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                  }}
                  className={glassBtn}
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <VolumeX className="size-4 text-foreground" />
                  ) : (
                    <Volume2 className="size-4 text-foreground" />
                  )}
                </button>
                <button
                  onClick={onTogglePlay}
                  className={glassBtn}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="size-4 text-foreground" />
                  ) : (
                    <Play className="size-4 text-foreground fill-foreground ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col gap-8 max-w-2xl">
        {/* Name + Categories */}
        <div className="flex items-start gap-5">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{mc.handle}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mc.brands.length} brands · {mc.contentCategories.length} categories
            </p>

            {/* Categories */}
            {mc.contentCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {mc.contentCategories.map((rawCatId) => {
                  const catId = rawCatId as ContentCategoryId;
                  const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
                  const s = CATEGORY_STYLES[catId];
                  if (!cat || !s) return null;
                  return (
                    <span
                      key={catId}
                      className={cn(
                        CHIP.base, CHIP.md, "font-semibold",
                        s.chipBg, s.chipBorder, s.chipText
                      )}
                    >
                      <span className={cn(`size-1.5 ${RADIUS.full}`, s.dot)} />
                      {cat.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Brands */}
        {mc.brands.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Briefcase className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Brand portfolio</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mc.brands.map((brand) => (
                <span
                  key={brand}
                  className={cn(
                    CHIP.base, CHIP.md, RADIUS.lg,
                    "bg-muted/60 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted hover:border-foreground/15 transition-colors"
                  )}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared design-token import that MCCard needs ────────────────

const TEXT_OPACITY = {
  dim: "text-muted-foreground/60",
} as const;
