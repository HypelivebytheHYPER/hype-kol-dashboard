"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface TikTokProfileEmbedProps {
  handle: string;
}

interface OEmbedData {
  html: string;
  title?: string;
  author_name?: string;
  author_url?: string;
}

export function TikTokProfileEmbed({ handle }: TikTokProfileEmbedProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjected = useRef(false);

  /* ── 1. Fetch oEmbed JSON from TikTok ── */
  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetch(`/api/tiktok-oembed?handle=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((json: OEmbedData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    );
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
    // Script already loaded — trigger render for this container
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

  /* ── Strip the <script> tag from oEmbed HTML (we inject it ourselves) ── */
  const blockquoteHtml = data.html.replace(
    /<script[\s\S]*?<\/script>/gi,
    ""
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">
          {data.author_name || "TikTok Profile"}
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
