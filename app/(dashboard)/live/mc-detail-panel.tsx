"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE, GLASS, CHIP, AVATAR, VIDEO_COVER } from "@/lib/design-tokens";
import type { LiveMC } from "@/lib/types/catalog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Briefcase,
  Film,
  Image,
  Radio,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface MCDetailPanelProps {
  mc: LiveMC;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function MCDetailPanel({
  mc,
  isPlaying,
  onTogglePlay,
  onClose,
  isMobile,
}: MCDetailPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Reset video index + error state when MC changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setLoading(false);
    setVideoError(false);
  }, [mc.id]);

  const activeVideo = mc.videos[activeVideoIndex];
  const videoUrl = activeVideo?.url ?? null;
  const hasVideo = !!videoUrl;

  const firstCatId = useMemo(() => {
    return (mc.contentCategories[0] as ContentCategoryId) ?? null;
  }, [mc.contentCategories]);

  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;

  // Sync muted state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  // Play / pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (isPlaying) {
      setLoading(video.readyState < 3);
      video.play().catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
      video.currentTime = 0;
      setMuted(true);
    }
  }, [isPlaying, hasVideo]);

  const handleVideoSwitch = (index: number) => {
    setActiveVideoIndex(index);
    if (!isPlaying) onTogglePlay();
  };

  const initial = mc.handle.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col h-full animate-scale-in">
      {/* Mobile header */}
      {isMobile && onClose && (
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-semibold text-sm">MC Profile</h2>
        </div>
      )}

      {/* Video Player Area */}
      <div className="bg-card border-b border-border">
        <div className="relative aspect-video max-h-[360px] bg-muted">
          {hasVideo && !videoError ? (
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              preload="auto"
              playsInline
              loop
              muted
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setVideoError(true);
              }}
              className={VIDEO_COVER}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[length:24px_24px]" />
              <div className={cn("relative flex flex-col items-center gap-3 px-6 py-5 rounded-2xl", GLASS.base)}>
                <div className={cn("size-12 rounded-full flex items-center justify-center", catStyle.avatarBg)}>
                  <Film className={cn("size-5", catStyle.avatarText)} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {videoError ? "Video unavailable" : "No video references"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {videoError ? "This file may have been removed or expired" : "This MC hasn't uploaded any videos yet"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isPlaying && loading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-40 backdrop-blur-sm">
              <Loader2 className="size-8 text-foreground animate-spin" />
            </div>
          )}

          {/* Play button overlay */}
          {!isPlaying && hasVideo && (
            <button
              onClick={onTogglePlay}
              className="absolute inset-0 flex items-center justify-center z-20 group/play"
              aria-label={`Play ${mc.handle}`}
            >
              <div className="relative flex items-center justify-center transition-all duration-300 ease-out scale-100 group-hover/play:scale-110">
                <div className={cn("absolute inset-0 rounded-full blur-xl scale-150 opacity-40 group-hover/play:opacity-70 transition-opacity duration-300", catStyle.playGlow)} />
                <div className={cn("size-14 rounded-full flex items-center justify-center shadow-lg", GLASS.base, GLASS.hover)}>
                  <Play className="size-6 text-foreground fill-foreground ml-0.5" />
                </div>
              </div>
            </button>
          )}

          {/* Video controls */}
          {isPlaying && (
            <div className="absolute inset-0 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                }}
                className={cn("absolute top-3 left-3 size-9 rounded-full flex items-center justify-center", GLASS.base, GLASS.hover)}
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
                className={cn("absolute top-3 right-3 size-9 rounded-full flex items-center justify-center", GLASS.base, GLASS.hover)}
                aria-label="Pause"
              >
                <Pause className="size-4 text-foreground" />
              </button>
              <button
                onClick={onTogglePlay}
                className="absolute inset-0 -z-10"
                aria-label="Pause"
              />
            </div>
          )}

          {/* LIVE badge — only when actually playing */}
          {isPlaying && (
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 pointer-events-none">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-foreground tracking-wide", GLASS.base)}>
                <Radio className="size-2.5 text-destructive" />
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Video thumbnail strip */}
        {mc.videos.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
            {mc.videos.map((video, i) => (
              <button
                key={video.token}
                onClick={() => handleVideoSwitch(i)}
                className={cn(
                  "relative shrink-0 w-28 h-16 rounded-lg border overflow-hidden flex items-center justify-center gap-1 transition-all duration-200",
                  activeVideoIndex === i
                    ? cn("ring-1", catStyle.activeBorder, catStyle.ring)
                    : "border-border hover:border-foreground/20"
                )}
              >
                <Film className={cn("size-5", catStyle.playButtonText)} />
                <span className="absolute bottom-1 left-1 right-1 truncate text-2xs text-foreground bg-background/70 backdrop-blur-sm rounded px-1">
                  {video.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Name + Categories */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                AVATAR.base,
                "size-12 text-lg",
                catStyle.avatarBg, catStyle.avatarBorder, catStyle.avatarText
              )}
            >
              {initial}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{mc.handle}</h2>
              <p className="text-xs text-muted-foreground">
                {mc.brands.length} brands · {mc.videos.length} videos ·{" "}
                {mc.contentCategories.length} categories
              </p>
            </div>
          </div>

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
                    <span className={cn("size-1.5 rounded-full", s.dot)} />
                    {cat.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Brands */}
        {mc.brands.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionHeader icon={Briefcase} title="Brand Portfolio" />
            <div className="flex flex-wrap gap-1.5">
              {mc.brands.map((brand) => (
                <span
                  key={brand}
                  className={cn(
                    CHIP.base, CHIP.md, "rounded-lg",
                    "bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/15 transition-colors"
                  )}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {mc.images.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionHeader icon={Image} title="Photos" count={mc.images.length} />
            <div className="flex flex-wrap gap-2">
              {mc.images.map((img) => (
                <a
                  key={img.token}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("shrink-0 w-28 h-16 rounded-lg border overflow-hidden transition-colors", catStyle.mediaHoverBorder)}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="size-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {mc.videos.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionHeader icon={Film} title="Video References" />
            <div className="flex flex-col gap-1">
              {mc.videos.map((video, i) => (
                <button
                  key={video.token}
                  onClick={() => handleVideoSwitch(i)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                    activeVideoIndex === i
                      ? cn("bg-muted text-foreground border", catStyle.activeBorder)
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Play className="size-3 shrink-0" />
                  <span className="truncate">{video.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
