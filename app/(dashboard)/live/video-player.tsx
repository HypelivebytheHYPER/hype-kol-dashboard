"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  muted: boolean;
}

export function VideoPlayer({ src, isPlaying, muted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const video = videoRef.current;

  // Load source
  useEffect(() => {
    if (!video) return;
    video.src = src;
    video.onloadeddata = () => setIsLoading(false);
  }, [src, video]);

  // Play/pause
  useEffect(() => {
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, video]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        muted={muted}
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
