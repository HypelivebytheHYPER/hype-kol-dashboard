"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface TikTokProfileEmbedProps {
  handle: string;
  name?: string;
}

interface OEmbedData {
  html: string;
  title?: string;
  author_name?: string;
  author_url?: string;
}

function buildSrcdoc(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;overflow-x:hidden;background:transparent}
</style>
</head>
<body>${html}</body>
</html>`;
}

export function TikTokProfileEmbed({ handle, name }: TikTokProfileEmbedProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(480);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ── Fetch oEmbed JSON ── */
  useEffect(() => {
    if (!handle) return;
    let stale = false;
    setLoading(true);
    setData(null);
    setHeight(480);
    fetch(`/api/tiktok-oembed?handle=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((json: OEmbedData) => {
        if (!stale) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!stale) setLoading(false);
      });
    return () => { stale = true; };
  }, [handle]);

  /* ── Resize iframe to match content ── */
  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;

    const body = iframe.contentDocument.body;

    // Set initial height
    setHeight(body.scrollHeight);

    // Watch for size changes
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.target.scrollHeight);
      }
    });
    observer.observe(body);

    // Also watch the documentElement for good measure
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

  if (!handle) return null;

  const profileUrl = `https://www.tiktok.com/@${handle}`;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80 bg-muted/30 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  /* ── Error / no data ── */
  if (!data?.html) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          Unable to load TikTok profile embed.
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-primary hover:underline"
          >
            Open @{handle} on TikTok →
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-t-2 border-t-chart-5">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-chart-5" />
          {data.author_name || name || `@${handle}`}
        </CardTitle>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="size-3" />
          Open in TikTok
        </a>
      </CardHeader>
      <CardContent className="pt-0">
        <iframe
          ref={iframeRef}
          srcDoc={buildSrcdoc(data.html)}
          onLoad={handleLoad}
          style={{ width: "100%", height, border: "none", display: "block" }}
          loading="lazy"
          title={`TikTok profile @${handle}`}
        />
      </CardContent>
    </Card>
  );
}
