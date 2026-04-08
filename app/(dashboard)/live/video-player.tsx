"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isPlaying: boolean;
  muted: boolean;
  onLoad?: () => void;
}

export function VideoPlayer({ src, poster, isPlaying, muted, onLoad }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        onLoad?.();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Failed to load video");
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else {
      // Native HLS support (Safari) or MP4
      video.src = src;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        onLoad?.();
      });
      video.addEventListener('error', () => {
        setError("Failed to load video");
      });
    }
  }, [src, onLoad]);

  // Play/pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Mute control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = muted;
    }
  }, [muted]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
        <p className="text-white/60 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        poster={poster}
        muted={muted}
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
    </>
  );
}

// Hook to preload video
export function usePreloadVideo(url: string | null) {
  useEffect(() => {
    if (!url) return;

    // Create link preload
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = url;
    document.head.appendChild(link);

    // Preload with fetch for faster response
    fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});

    return () => {
      link.remove();
    };
  }, [url]);
}

// Hook to generate poster from video token
export function useVideoPoster(token: string | null) {
  // In production, you'd have a thumbnail service
  // For now, return gradient based on token
  if (!token) return null;
  
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
  ];
  return gradients[token.charCodeAt(0) % gradients.length];
}
