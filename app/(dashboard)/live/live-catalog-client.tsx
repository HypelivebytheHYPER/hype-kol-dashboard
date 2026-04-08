"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Play, Video, Pause, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import type { LiveMC } from "@/lib/types/catalog";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
  videoUrls: Record<string, string>;
}

export function LiveCatalogClient({ mcs, videoUrls }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = searchQuery.trim()
    ? mcs.filter((mc) =>
        mc.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mc.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mcs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live MC Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MC portfolio with video references and brand experience
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">MCs</p>
            <p className="text-lg font-mono font-bold">{formatNumber(filtered.length)}</p>
          </div>
        </div>
      </div>

      {mcs.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by handle or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filtered.map((mc) => (
          <MCCard
            key={mc.id}
            mc={mc}
            videoUrl={mc.videos[0]?.token ? videoUrls[mc.videos[0].token] : null}
            isPlaying={playingId === mc.id}
            onPlay={() => setPlayingId(playingId === mc.id ? null : mc.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Video className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No MCs found</p>
        </div>
      )}
    </div>
  );
}

// Generate a gradient placeholder based on the MC name
function generatePlaceholder(handle: string): string {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500", 
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-red-500 to-orange-500",
  ];
  const index = handle.charCodeAt(0) % colors.length;
  return colors[index];
}

function MCCard({
  mc,
  videoUrl,
  isPlaying,
  onPlay,
}: {
  mc: LiveMC;
  videoUrl: string | null;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Intersection Observer: only load video when card is visible
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          // Once visible, we can stop observing
          observer.unobserve(card);
        }
      },
      { 
        rootMargin: "100px", // Start loading 100px before it enters viewport
        threshold: 0 
      }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Handle play/pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;

    if (isPlaying) {
      setIsLoading(true);
      v.play()
        .then(() => {
          setIsLoading(false);
          setHasLoaded(true);
        })
        .catch(() => setIsLoading(false));
    } else {
      v.pause();
      // Reset to beginning when paused
      v.currentTime = 0;
    }
  }, [isPlaying, videoUrl]);

  const handlePlayClick = useCallback(() => {
    if (!videoUrl) return;
    onPlay();
  }, [onPlay, videoUrl]);

  const placeholderGradient = generatePlaceholder(mc.handle);
  const initials = mc.handle.slice(0, 2).toUpperCase();

  return (
    <div 
      ref={cardRef}
      className="relative rounded-xl overflow-hidden bg-zinc-900"
    >
      <div className="relative aspect-[9/16]">
        {/* Video - only render when in viewport */}
        {isInViewport && videoUrl ? (
          <video
            ref={videoRef}
            src={isPlaying || hasLoaded ? videoUrl : undefined}
            muted
            playsInline
            preload="none"
            loop
            onCanPlay={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {/* Placeholder / Poster (shown when video not loaded) */}
        {(!isInViewport || !videoUrl || (!isPlaying && !hasLoaded)) && (
          <div className={`absolute inset-0 bg-gradient-to-b ${placeholderGradient} flex flex-col items-center justify-center`}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            {!videoUrl && <Video className="w-6 h-6 text-white/40 mt-2" />}
          </div>
        )}

        {/* Play button overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayClick}
            disabled={!videoUrl}
            className="absolute inset-0 w-full h-full z-10 cursor-pointer disabled:cursor-not-allowed"
            aria-label={videoUrl ? "Play" : "No video available"}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                videoUrl 
                  ? "bg-black/40 backdrop-blur-sm hover:bg-black/60" 
                  : "bg-black/20"
              }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Play className={`w-5 h-5 text-white fill-white ml-0.5 ${!videoUrl ? "opacity-40" : ""}`} />
                )}
              </div>
            </div>
          </button>
        )}

        {/* Pause button + loading indicator when playing */}
        {isPlaying && (
          <button
            onClick={onPlay}
            className="absolute inset-0 w-full h-full z-10 cursor-pointer"
            aria-label="Pause"
          >
            {/* Center loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {/* Pause indicator */}
            <div className="absolute top-2 right-2 z-20 pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                <Pause className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </button>
        )}

        {/* Video count badge */}
        {!isPlaying && mc.videos.length > 1 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium">
              {mc.videos.length} vid
            </span>
          </div>
        )}

        {/* Info overlay at bottom */}
        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
            <p className="text-white font-semibold text-sm truncate">{mc.handle}</p>
            {mc.brands.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {mc.brands.slice(0, 3).map((brand) => (
                  <span key={brand} className="px-1.5 py-0.5 rounded bg-white/15 text-white/80 text-[9px]">
                    {brand}
                  </span>
                ))}
                {mc.brands.length > 3 && (
                  <span className="px-1.5 py-0.5 text-white/50 text-[9px]">
                    +{mc.brands.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
