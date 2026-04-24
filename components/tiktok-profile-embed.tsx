"use client";

import { useEffect, useRef, useState } from "react";
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

export function TikTokProfileEmbed({ handle, name }: TikTokProfileEmbedProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjected = useRef(false);

  /* ── 1. Fetch oEmbed JSON ── */
  useEffect(() => {
    if (!handle) return;
    let stale = false;
    setLoading(true);
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
    return () => {
      stale = true;
    };
  }, [handle]);

  /* ── 2. Render embed once HTML is in the DOM ── */
  useEffect(() => {
    if (!data?.html || !containerRef.current) return;

    const renderEmbed = () => {
      const lib = (window as any).tiktokEmbedLibrary;
      if (lib && containerRef.current) {
        lib.render(containerRef.current);
      }
    };

    const existing = document.querySelector(
      'script[src="https://www.tiktok.com/embed.js"]'
    ) as HTMLScriptElement | null;

    if (!existing && !scriptInjected.current) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.onload = renderEmbed;
      document.body.appendChild(script);
      scriptInjected.current = true;
      return () => {
        script.onload = null;
      };
    }

    if (existing && !(window as any).tiktokEmbedLibrary) {
      // Script tag exists but library hasn't loaded yet — wait for it
      const onLoad = () => renderEmbed();
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }

    // Script already loaded — render immediately
    renderEmbed();
    return undefined;
  }, [data]);

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
        </CardContent>
      </Card>
    );
  }

  /* ── Strip the <script> tag from oEmbed HTML ── */
  const blockquoteHtml = data.html.replace(
    /<script[\s\S]*?<\/script>/gi,
    ""
  );

  return (
    <Card className="overflow-hidden border-t-2 border-t-chart-5">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-5" />
          {data.author_name || name || `@${handle}`}
        </CardTitle>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open in TikTok
        </a>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={containerRef}
          className="flex justify-center"
          dangerouslySetInnerHTML={{ __html: blockquoteHtml }}
        />
      </CardContent>
    </Card>
  );
}
