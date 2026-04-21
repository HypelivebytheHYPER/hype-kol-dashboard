"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { CONTENT_CATEGORIES } from "@/lib/taxonomy";
import type { LiveMC } from "@/lib/types/catalog";

interface MCVideoCardProps {
  mc: LiveMC;
  videoUrl: string | null;
  isPlaying: boolean;
  onPlay: () => void;
}

export function MCVideoCard({ mc, videoUrl, isPlaying, onPlay }: MCVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, [isPlaying]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-zinc-900">
      <div className="relative aspect-[9/16]">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={`${videoUrl}#t=0.1`}
            preload="metadata"
            playsInline
            loop
            muted
            onLoadedData={() => setLoading(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-800" />
        )}

        {isPlaying && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {!isPlaying && (
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center z-20"
            aria-label={`Play ${mc.handle}`}
          >
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </button>
        )}

        {isPlaying && (
          <div className="absolute inset-0 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
              className="absolute top-3 left-3 w-12 h-12 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
            </button>
            <button
              onClick={onPlay}
              className="absolute top-3 right-3 w-12 h-12 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-6 h-6 text-white" />
            </button>
            <button onClick={onPlay} className="absolute inset-0 -z-10" aria-label="Pause" />
          </div>
        )}

        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20">
            <p className="text-white font-semibold text-sm truncate">{mc.handle}</p>
            {mc.contentCategories.length > 0 && (
              <div className="flex gap-1 mt-1">
                {mc.contentCategories.map((catId) => {
                  const cat = CONTENT_CATEGORIES.find((c) => c.id === catId);
                  if (!cat) return null;
                  return (
                    <span key={catId} className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} title={cat.label} />
                  );
                })}
              </div>
            )}
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
