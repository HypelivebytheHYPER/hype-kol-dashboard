"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── iframe embed helper ─────────────────────────────────────────────── */

function buildVideoSrcdoc(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;background:transparent}
  body{display:flex;justify-content:center;align-items:center;min-height:100vh}
</style>
</head>
<body>${html}</body>
</html>`;
}

function TikTokVideoEmbed({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(640);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    const body = iframe.contentDocument.body;
    setHeight(body.scrollHeight);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.target.scrollHeight);
      }
    });
    observer.observe(body);
    observer.observe(iframe.contentDocument.documentElement);
    (iframe as any).__tkObserver = observer;
  }, []);

  useEffect(() => {
    return () => {
      const iframe = iframeRef.current;
      if (iframe && (iframe as any).__tkObserver) {
        (iframe as any).__tkObserver.disconnect();
      }
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={buildVideoSrcdoc(html)}
      onLoad={handleLoad}
      style={{ width: "100%", height, border: "none", display: "block" }}
      loading="lazy"
      title="TikTok video"
    />
  );
}

/* ── types ───────────────────────────────────────────────────────────── */

interface TikTokVideo {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  authorName?: string;
  html?: string;
}

interface TikTokVideoCarouselProps {
  handle: string;
}

export function TikTokVideoCarousel({ handle }: TikTokVideoCarouselProps) {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handle) return;
    let stale = false;
    setLoading(true);
    fetch(`/api/tiktok-videos?handle=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((data: { videos?: TikTokVideo[] }) => {
        if (!stale) {
          setVideos(data.videos || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!stale) setLoading(false);
      });
    return () => { stale = true; };
  }, [handle]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  }, []);

  const openVideo = (video: TikTokVideo) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };

  if (!handle) return null;

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="h-5 w-40 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[200px] h-[280px] bg-muted/30 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="overflow-hidden border-t-2 border-t-chart-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-chart-5" />
            Latest Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-6 text-center text-muted-foreground text-sm">
          No videos found for @{handle}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-t-2 border-t-chart-5">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-chart-5" />
            Latest Videos
            <span className="text-xs text-muted-foreground font-normal">
              ({videos.length})
            </span>
          </CardTitle>
          <a
            href={`https://www.tiktok.com/@${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="size-3" />
            View all
          </a>
        </CardHeader>
        <CardContent className="pt-0 relative">
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="size-4" />
          </Button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => openVideo(video)}
                className={cn(
                  "group relative shrink-0 w-[180px] sm:w-[200px] snap-start",
                  "rounded-xl overflow-hidden bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "active:scale-[0.98] transition-transform touch-manipulation"
                )}
                style={{ aspectRatio: "9/16" }}
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title || "TikTok video"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No thumbnail</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-12 rounded-full bg-foreground/20 backdrop-blur-sm border border-foreground/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Play className="size-5 text-foreground fill-foreground ml-0.5" />
                  </div>
                </div>

                {video.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-xs text-foreground font-medium line-clamp-2 drop-shadow-sm">
                      {video.title}
                    </p>
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold text-foreground bg-background/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    TikTok
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedVideo?.title || "TikTok Video"}</DialogTitle>
          </DialogHeader>
          {selectedVideo?.html ? (
            <TikTokVideoEmbed html={selectedVideo.html} />
          ) : selectedVideo?.url ? (
            <div className="aspect-[9/16] flex items-center justify-center bg-muted">
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-8" />
                <span className="text-sm">Open in TikTok</span>
              </a>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
