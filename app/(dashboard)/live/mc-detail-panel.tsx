"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE, GLASS, CHIP, AVATAR } from "@/lib/design-tokens";
import type { LiveMC } from "@/lib/types/catalog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Briefcase,
  Image,
  Radio,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    setActiveVideoIndex(0);
    setLoading(false);
  }, [mc.id]);

  const activeVideo = mc.videos[activeVideoIndex];
  const videoUrl = activeVideo?.url ?? null;
  const hasVideo = !!videoUrl;

  const firstCatId = useMemo(() => {
    return (mc.contentCategories[0] as ContentCategoryId) ?? null;
  }, [mc.contentCategories]);

  const catStyle = firstCatId ? CATEGORY_STYLES[firstCatId] : UNCATEGORIZED_STYLE;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

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
    <div className="flex flex-col animate-scale-in">
      {/* Mobile header */}
      {isMobile && onClose && (
        <div className="flex items-center gap-3 p-4 border-b border-border/60">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-semibold text-sm">MC Profile</h2>
        </div>
      )}

      {/* Video Player Area */}
      <div className="rounded-3xl overflow-hidden bg-muted/40 border border-border/40 mb-8">
        <div className="relative max-h-[520px] lg:max-h-[640px] flex items-center justify-center overflow-hidden">
          {hasVideo && (
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              preload="metadata"
              playsInline
              loop
              muted
              onLoadedData={() => setLoading(false)}
              className="max-h-[520px] lg:max-h-[640px] max-w-full object-contain"
            />
          )}

          {/* Loading overlay */}
          {isPlaying && loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 z-40 backdrop-blur-sm">
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
                <div className={cn("size-16 rounded-full flex items-center justify-center shadow-lg", GLASS.base, GLASS.hover)}>
                  <Play className="size-7 text-foreground fill-foreground ml-0.5" />
                </div>
              </div>
            </button>
          )}

          {/* Video controls + LIVE badge */}
          {isPlaying && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-auto">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-foreground tracking-wide text-xs", GLASS.base)}>
                  <Radio className="size-2.5 text-destructive" />
                  LIVE
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMuted((m) => !m);
                    }}
                    className={cn("size-9 rounded-full flex items-center justify-center", GLASS.base, GLASS.hover)}
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
                    className={cn("size-9 rounded-full flex items-center justify-center", GLASS.base, GLASS.hover)}
                    aria-label="Pause"
                  >
                    <Pause className="size-4 text-foreground" />
                  </button>
                </div>
              </div>
              <button
                onClick={onTogglePlay}
                className="absolute inset-0 bg-transparent focus-visible:bg-background/10 transition-colors"
                aria-label="Pause video"
              />
            </div>
          )}
        </div>

        {/* Video thumbnail strip */}
        {mc.videos.length > 1 && (
          <div className="flex gap-2.5 p-4 overflow-x-auto scrollbar-hide">
            {mc.videos.map((video, i) => (
              <button
                key={video.token}
                onClick={() => handleVideoSwitch(i)}
                className={cn(
                  "relative shrink-0 w-24 h-40 rounded-xl border overflow-hidden transition-all duration-200",
                  activeVideoIndex === i
                    ? cn("ring-2", catStyle.activeBorder, catStyle.ring)
                    : "border-border/60 hover:border-foreground/20"
                )}
              >
                <video
                  src={video.url}
                  preload="metadata"
                  muted
                  playsInline
                  className="absolute inset-0 size-full object-cover"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.duration > 0) v.currentTime = Math.min(0.5, v.duration * 0.1);
                  }}
                />
                <span className="absolute bottom-0 left-0 right-0 truncate text-2xs text-foreground bg-background/70 backdrop-blur-sm px-1.5 py-0.5">
                  Video {i + 1}
                </span>
                {activeVideoIndex === i && (
                  <span className={cn("absolute top-1.5 right-1.5 size-2 rounded-full", catStyle.dot)} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col gap-8 max-w-2xl">
        {/* Name + Avatar + Categories */}
        <div className="flex items-start gap-5">
          <div
            className={cn(
              AVATAR.base,
              "size-14 text-xl",
              catStyle.avatarBg, catStyle.avatarBorder, catStyle.avatarText
            )}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{mc.handle}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mc.brands.length} brands · {mc.videos.length} videos · {mc.contentCategories.length} categories
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
                      <span className={cn("size-1.5 rounded-full", s.dot)} />
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
              <span className="text-sm font-medium text-muted-foreground">
                Brand portfolio
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mc.brands.map((brand) => (
                <span
                  key={brand}
                  className={cn(
                    CHIP.base, CHIP.md, "rounded-xl",
                    "bg-muted/60 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted hover:border-foreground/15 transition-colors"
                  )}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {mc.images.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Photos ({mc.images.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mc.images.map((img) => (
                <a
                  key={img.token}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("shrink-0 w-24 h-24 rounded-xl border overflow-hidden transition-colors", catStyle.mediaHoverBorder)}
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


      </div>
    </div>
  );
}
