"use client";

import { useState } from "react";
import { Search, X, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import { MCVideoCard } from "./mc-video-card";
import type { LiveMC } from "@/lib/types/catalog";

interface LiveCatalogClientProps {
  mcs: LiveMC[];
  videoUrls: Record<string, string>;
}

export function LiveCatalogClient({ mcs, videoUrls }: LiveCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = searchQuery.trim()
    ? mcs.filter((mc) =>
        mc.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mc.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mcs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live MC Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MC portfolio with video references and brand experience
          </p>
        </div>
        <div className="flex items-baseline gap-4 sm:text-right">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">MCs</p>
            <p className="text-lg font-mono font-bold">{formatNumber(filtered.length)}</p>
          </div>
        </div>
      </div>

      {mcs.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by handle or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filtered.map((mc) => (
          <MCVideoCard
            key={mc.id}
            mc={mc}
            videoUrl={mc.videos[0]?.token ? videoUrls[mc.videos[0].token] : null}
            isPlaying={playingId === mc.id}
            onPlay={() => setPlayingId(playingId === mc.id ? null : mc.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Video className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No MCs found</p>
        </div>
      )}
    </div>
  );
}
