"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { VideoPlayer, usePreloadVideo } from "./video-player";
import type { LiveMC } from "@/lib/types/catalog";

interface MCVideoCardProps {
  mc: LiveMC;
  videoUrl: string | null;
  nextVideoUrl?: string | null;
  isPlaying: boolean;
  onPlay: () => void;
}

function generatePlaceholder(handle: string): string {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500", 
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-red-500 to-orange-500",
  ];
  return colors[handle.charCodeAt(0) % colors.length];
}

export function MCVideoCard({ 
  mc, 
  videoUrl, 
  nextVideoUrl, 
  isPlaying, 
  onPlay 
}: MCVideoCardProps) {
  const [muted, setMuted] = useState(true); // Start muted for autoplay
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset mute when video stops
  useEffect(() => {
    if (!isPlaying) {
      setMuted(true);
    }
  }, [isPlaying]);

  usePreloadVideo(isPlaying && nextVideoUrl ? nextVideoUrl : null);

  const gradient = generatePlaceholder(mc.handle);
  const initials = mc.handle.slice(0, 2).toUpperCase();
  const showVideo = mounted && isPlaying && videoUrl;

  return (
    <div className="relative rounded-xl overflow-hidden bg-zinc-900">
      <div className="relative aspect-[9/16]">
        {/* Video or Placeholder */}
        {showVideo ? (
          <VideoPlayer src={videoUrl} isPlaying={isPlaying} muted={muted} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-b ${gradient} flex items-center justify-center`}>
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
        )}

        {/* Play button - only when not playing */}
        {!isPlaying && (
          <button 
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </button>
        )}

        {/* Controls container - only when playing */}
        {isPlaying && mounted && (
          <div className="absolute inset-0 z-20">
            {/* Mute button - TOP LEFT */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
              }}
              className="absolute top-3 left-3 w-12 h-12 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Pause indicator - TOP RIGHT */}
            <button
              onClick={onPlay}
              className="absolute top-3 right-3 w-12 h-12 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-6 h-6 text-white" />
            </button>

            {/* Invisible click area for pause (below buttons) */}
            <button
              onClick={onPlay}
              className="absolute inset-0 -z-10"
              aria-label="Pause"
            />
          </div>
        )}

        {/* Video count */}
        {!isPlaying && mc.videos.length > 1 && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium z-20">
            {mc.videos.length} vid
          </div>
        )}

        {/* Info */}
        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20">
            <p className="text-white font-semibold text-sm truncate">{mc.handle}</p>
            {mc.brands.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {mc.brands.slice(0, 3).map((b) => (
                  <span key={b} className="px-1.5 py-0.5 rounded bg-white/15 text-white/80 text-[9px]">{b}</span>
                ))}
                {mc.brands.length > 3 && (
                  <span className="text-white/50 text-[9px]">+{mc.brands.length - 3}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
