"use client";

import Link from "next/link";
import { Radio, TrendingUp, Users, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatNumber, formatCurrency, getTierColor } from "@/lib/utils";

interface KOLCardProps {
  kol: {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
    platform: string;
    tier: string;
    followers: number;
    engagementRate: number;
    avgGMV: number;
    qualityScore: number;
    categories: string[];
    location: string;
    isLiveNow?: boolean;
    liveStats?: {
      currentViewers: number;
      gmv: number;
      duration: number;
    };
  };
}

export function KOLCard({ kol }: KOLCardProps) {
  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={kol.avatar} />
            <AvatarFallback>{kol.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{kol.name}</h4>
              {kol.isLiveNow && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 live-indicator" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {kol.handle}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`${getTierColor(kol.tier)} text-white text-[10px]`}
              >
                {kol.tier}
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">
                {kol.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        {kol.isLiveNow && kol.liveStats && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-red-500">
                  <Eye className="w-3 h-3" />
                  <span className="text-sm font-bold">
                    {formatNumber(kol.liveStats.currentViewers)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Viewers</p>
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">
                  {formatCurrency(kol.liveStats.gmv)}
                </p>
                <p className="text-[10px] text-muted-foreground">GMV</p>
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">
                  {kol.liveStats.duration}m
                </p>
                <p className="text-[10px] text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-sm font-bold font-mono">
              {formatNumber(kol.followers)}
            </p>
            <p className="text-[10px] text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-sm font-bold font-mono">
              {kol.engagementRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Engagement</p>
          </div>
          <div>
            <p className="text-sm font-bold font-mono">
              {formatCurrency(kol.avgGMV)}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg GMV</p>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 flex flex-wrap gap-1">
          {kol.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="outline" className="text-[10px]">
              {category}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/kols/${kol.id}`}>View Profile</Link>
          </Button>
          <Button size="sm" className="flex-1">
            Add to Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
