"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  muted: boolean;
}

export function VideoPlayer({ src, isPlaying, muted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Handle source change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLoading(false));
      return () => hls.destroy();
    } else {
      video.src = src;
      video.onloadeddata = () => setIsLoading(false);
    }
  }, [src]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <>
      <video
        ref={videoRef}
        muted={muted}  // Direct binding - no useEffect needed
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
    </>
  );
}

// Preload hook
export function usePreloadVideo(url: string | null) {
  useEffect(() => {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = url;
    document.head.appendChild(link);
    return () => link.remove();
  }, [url]);
}
