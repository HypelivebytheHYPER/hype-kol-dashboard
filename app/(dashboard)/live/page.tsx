"use client";

import { useState } from "react";
import { Radio, TrendingUp, Users, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/utils";

const liveNowKOLs = [
  {
    id: "1",
    name: "Mintra",
    handle: "@mintrako8764",
    avatar: "/avatars/mintra.jpg",
    platform: "tiktok",
    currentViewers: 12000,
    gmv: 450000,
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    productsSold: 156,
    engagement: 8.5,
    chatMessages: 2340,
  },
  {
    id: "2",
    name: "Winwin Center",
    handle: "@winwincenter",
    avatar: "/avatars/winwin.jpg",
    platform: "tiktok",
    currentViewers: 8500,
    gmv: 380000,
    startedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    productsSold: 98,
    engagement: 7.2,
    chatMessages: 1850,
  },
  {
    id: "3",
    name: "TechReviewer Pro",
    handle: "@techreviewer_pro",
    avatar: "/avatars/tech.jpg",
    platform: "youtube",
    currentViewers: 5200,
    gmv: 120000,
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    productsSold: 45,
    engagement: 5.8,
    chatMessages: 890,
  },
  {
    id: "4",
    name: "Beauty Blogger Sarah",
    handle: "@sarahbeauty",
    avatar: "/avatars/sarah.jpg",
    platform: "instagram",
    currentViewers: 3100,
    gmv: 95000,
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    productsSold: 32,
    engagement: 12.3,
    chatMessages: 1200,
  },
];

const scheduledKOLs = [
  {
    id: "5",
    name: "Pimprapa",
    handle: "@pimprapa",
    avatar: "/avatars/pimprapa.jpg",
    platform: "tiktok",
    scheduledFor: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    estimatedViewers: 8000,
    campaign: "Sunscreen Launch",
  },
  {
    id: "6",
    name: "Foodie Explorer",
    handle: "@foodie_explorer",
    avatar: "/avatars/foodie.jpg",
    platform: "tiktok",
    scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    estimatedViewers: 15000,
    campaign: "Restaurant Week",
  },
];

const leaderboard = {
  today: [
    { rank: 1, name: "Mintra", gmv: 450000, viewers: 12000 },
    { rank: 2, name: "Winwin Center", gmv: 380000, viewers: 8500 },
    { rank: 3, name: "TechReviewer Pro", gmv: 120000, viewers: 5200 },
    { rank: 4, name: "Beauty Blogger Sarah", gmv: 95000, viewers: 3100 },
  ],
  week: [
    { rank: 1, name: "Mintra", gmv: 2100000, viewers: 56000 },
    { rank: 2, name: "Foodie Explorer", gmv: 1800000, viewers: 42000 },
    { rank: 3, name: "Winwin Center", gmv: 1650000, viewers: 38000 },
    { rank: 4, name: "TechReviewer Pro", gmv: 890000, viewers: 21000 },
  ],
};

function getDuration(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

function formatTimeUntil(date: string): string {
  const diff = new Date(date).getTime() - Date.now();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) {
    return `in ${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  return `in ${hours}h ${minutes % 60}m`;
}

export default function LiveCenterPage() {
  const totalLiveGMV = liveNowKOLs.reduce((sum, k) => sum + k.gmv, 0);
  const totalViewers = liveNowKOLs.reduce((sum, k) => sum + k.currentViewers, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-display font-bold">Live Center</h1>
          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
            <Radio className="w-3 h-3 mr-1 live-indicator" />
            {liveNowKOLs.length} Live
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of live commerce
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-3xl font-bold">{liveNowKOLs.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <Radio className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Viewers</p>
                <p className="text-3xl font-bold">{formatNumber(totalViewers)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live GMV</p>
                <p className="text-3xl font-bold">{formatCurrency(totalLiveGMV)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-3xl font-bold">38m</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Now Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-title font-semibold">Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveNowKOLs.map((kol) => (
              <Card key={kol.id} className="border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={kol.avatar} />
                      <AvatarFallback>{kol.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{kol.name}</h4>
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <span className="w-2 h-2 rounded-full bg-red-500 live-indicator" />
                          LIVE
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {kol.handle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {kol.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getDuration(kol.startedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-1 text-red-500">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">
                          {formatNumber(kol.currentViewers)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Current Viewers
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">
                          {formatCurrency(kol.gmv)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">GMV</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Watch
                    </Button>
                    <Button size="sm" className="flex-1">
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scheduled */}
          <h2 className="text-title font-semibold mt-8">Starting Soon</h2>
          <div className="space-y-3">
            {scheduledKOLs.map((kol) => (
              <Card key={kol.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={kol.avatar} />
                      <AvatarFallback>{kol.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{kol.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {kol.handle} · {kol.campaign}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{formatTimeUntil(kol.scheduledFor)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Est. {formatNumber(kol.estimatedViewers)} viewers
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="w-full">
                  <TabsTrigger value="today" className="flex-1">
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex-1">
                    This Week
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-4 space-y-3">
                  {leaderboard.today.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500/20 text-yellow-500"
                              : entry.rank === 2
                              ? "bg-gray-400/20 text-gray-400"
                              : entry.rank === 3
                              ? "bg-orange-600/20 text-orange-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">
                          {formatCurrency(entry.gmv)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="week" className="mt-4 space-y-3">
                  {leaderboard.week.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500/20 text-yellow-500"
                              : entry.rank === 2
                              ? "bg-gray-400/20 text-gray-400"
                              : entry.rank === 3
                              ? "bg-orange-600/20 text-orange-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">
                          {formatCurrency(entry.gmv)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
