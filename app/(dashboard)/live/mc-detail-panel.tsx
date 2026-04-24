"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { CONTENT_CATEGORIES, type ContentCategoryId } from "@/lib/taxonomy";
import { CATEGORY_STYLES, UNCATEGORIZED_STYLE } from "@/lib/design-tokens";
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
  const [videoError, setVideoError] = useState(false);

  // Reset video index when MC changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setVideoError(false);
    setLoading(false);
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
    if (!video || !hasVideo || videoError) return;

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
  }, [isPlaying, hasVideo, videoError]);

  const handleVideoSwitch = (index: number) => {
    setActiveVideoIndex(index);
    setVideoError(false);
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
      <div className="relative bg-card border-b border-border">
        <div className="relative aspect-video max-h-[360px]">
          {isPlaying && hasVideo && !videoError ? (
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              preload="auto"
              playsInline
              loop
              muted
              onLoadedData={() => setLoading(false)}
              onError={() => setVideoError(true)}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className={cn("absolute inset-0 flex items-center justify-center overflow-hidden", catStyle.chipBg)}>
              {/* Subtle category gradient overlay */}
              <div className={cn("absolute inset-0 opacity-30", catStyle.avatarBg)} />
              <div className="relative flex flex-col items-center gap-4">
                {/* Avatar + handle row */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "relative size-14 rounded-xl flex items-center justify-center border text-xl font-bold overflow-hidden shrink-0",
                      mc.image
                        ? "bg-muted"
                        : [catStyle.avatarBg, catStyle.avatarBorder, catStyle.avatarText]
                    )}
                  >
                    {mc.image ? (
                      <img
                        src={mc.image}
                        alt={mc.handle}
                        className="size-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.textContent = initial;
                        }}
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{mc.handle}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeVideo?.name ?? `${mc.videos.length} video${mc.videos.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                {/* Play button */}
                {hasVideo && (
                  <button
                    onClick={onTogglePlay}
                    className="relative flex items-center justify-center group/play"
                    aria-label={`Play ${mc.handle}`}
                  >
                    <div className={cn("absolute inset-0 rounded-full blur-xl scale-150 opacity-40 group-hover/play:opacity-70 transition-opacity duration-300", catStyle.playGlow)} />
                    <div className="relative size-14 rounded-full bg-background/70 backdrop-blur-md border border-foreground/15 flex items-center justify-center hover:bg-background/90 transition-colors shadow-lg">
                      <Play className="size-6 text-foreground fill-foreground ml-0.5" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isPlaying && loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-40 backdrop-blur-sm">
              <Loader2 className="size-8 text-foreground animate-spin" />
            </div>
          )}

          {/* Video controls */}
          {isPlaying && (
            <div className="absolute inset-0 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                }}
                className="absolute top-3 left-3 size-9 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center hover:bg-background/90 transition-colors border border-foreground/10"
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
                className="absolute top-3 right-3 size-9 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center hover:bg-background/90 transition-colors border border-foreground/10"
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-md border border-foreground/10 text-[10px] font-bold text-foreground tracking-wide">
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
                  "relative shrink-0 size-16 rounded-lg border overflow-hidden flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  activeVideoIndex === i
                    ? cn("ring-1", catStyle.activeBorder, catStyle.ring)
                    : "border-border hover:border-foreground/20"
                )}
              >
                <Film className={cn("size-5", catStyle.playButtonText)} />
                <span className="absolute bottom-1 left-1 right-1 truncate text-[9px] text-foreground bg-background/70 backdrop-blur-sm rounded px-1">
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
                "size-12 rounded-xl flex items-center justify-center border text-lg font-bold shrink-0 overflow-hidden",
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
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.textContent = initial;
                  }}
                />
              ) : (
                initial
              )}
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
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
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
            <div className="flex items-center gap-2">
              <Briefcase className="size-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Brand Portfolio
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mc.brands.map((brand) => (
                <span
                  key={brand}
                  className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium border border-border hover:border-foreground/15 hover:text-foreground transition-colors"
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
            <div className="flex items-center gap-2">
              <Image className="size-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Photos ({mc.images.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {mc.images.map((img) => (
                <a
                  key={img.token}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("relative shrink-0 size-16 rounded-lg border overflow-hidden transition-colors", catStyle.mediaHoverBorder)}
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
            <div className="flex items-center gap-2">
              <Film className="size-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Video References
              </h3>
            </div>
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
