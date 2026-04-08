"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Loader2, Volume2, VolumeX } from "lucide-react";
import type { LiveMC } from "@/lib/types/catalog";

interface MCVideoCardProps {
  mc: LiveMC;
  videoUrl: string | null;
  isPlaying: boolean;
  onPlay: () => void;
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
    "from-teal-500 to-green-500",
    "from-indigo-500 to-purple-500",
  ];
  const index = handle.charCodeAt(0) % colors.length;
  return colors[index];
}

export function MCVideoCard({ mc, videoUrl, isPlaying, onPlay }: MCVideoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Intersection Observer: only activate when card is visible
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.unobserve(card);
        }
      },
      { 
        rootMargin: "50px",
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
      v.currentTime = 0;
    }
  }, [isPlaying, videoUrl]);

  // Handle mute/unmute
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
  }, [isMuted]);

  const handlePlayClick = useCallback(() => {
    if (!videoUrl) return;
    onPlay();
  }, [onPlay, videoUrl]);

  const placeholderGradient = generatePlaceholder(mc.handle);
  const initials = mc.handle.slice(0, 2).toUpperCase();
  const showVideo = isInViewport && videoUrl && (isPlaying || hasLoaded);

  return (
    <div 
      ref={cardRef}
      className="relative rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
      onClick={handlePlayClick}
    >
      <div className="relative aspect-[9/16]">
        {/* Video - only render when in viewport AND playing/loaded */}
        {showVideo && (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            preload="none"
            loop
            onCanPlay={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Placeholder - shown when video not playing */}
        {(!showVideo) && (
          <div className={`absolute inset-0 bg-gradient-to-b ${placeholderGradient} flex flex-col items-center justify-center`}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoUrl 
                ? "bg-black/40 backdrop-blur-sm hover:scale-110" 
                : "bg-black/20"
            }`}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Play className={`w-5 h-5 text-white fill-white ml-0.5 ${!videoUrl ? "opacity-40" : ""}`} />
              )}
            </div>
          </div>
        )}

        {/* Pause indicator + Mute toggle when playing */}
        {isPlaying && (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {/* Mute/Unmute button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-2 left-2 z-20 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            {/* Pause indicator */}
            <div className="absolute top-2 right-2 z-20">
              <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                <Pause className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </>
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
