"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Radio,
  TrendingUp,
  Users,
  Clock,
  Play,
  Heart,
  Share2,
  Flame,
  Star,
  Calendar,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KOLAvatar } from "@/components/ui/premium-avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveSellers, useKOLs } from "@/hooks";
import { getKOLImageUrl, type ApiLiveSeller } from "@/lib/lark-api";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function LiveShowcasePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("live");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sellersData, isLoading: sellersLoading } = useLiveSellers();
  const { data: kolsData } = useKOLs();

  const sellers = sellersData?.data || [];
  const allKOLs = kolsData?.data || [];

  // Live now sellers (computedImageUrl provided by API)
  const liveNow = useMemo(() => {
    return sellers
      .filter((s) => s.isLiveNow)
      .sort((a, b) => (b.avgLiveGMV || 0) - (a.avgLiveGMV || 0));
  }, [sellers]);

  // Redirect to top performers if no one is live
  useEffect(() => {
    if (!sellersLoading && activeTab === "live" && liveNow.length === 0) {
      setActiveTab("top");
    }
  }, [sellersLoading, activeTab, liveNow.length]);

  // Top performers (all sellers sorted by GMV)
  const topPerformers = useMemo(() => {
    return [...sellers].sort((a, b) => (b.avgLiveGMV || 0) - (a.avgLiveGMV || 0)).slice(0, 10);
  }, [sellers]);

  // Rising live sellers (high engagement, growing)
  const risingSellers = useMemo(() => {
    return sellers
      .filter((s) => s.engagementRate > 5 && s.followers < 500000)
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 6);
  }, [sellers]);

  // Stats
  const stats = useMemo(() => {
    const totalLive = liveNow.length;
    const totalGMV = sellers.reduce((sum, s) => sum + (s.avgLiveGMV || 0), 0);
    const totalFollowers = sellers.reduce((sum, s) => sum + s.followers, 0);
    const avgEngagement =
      sellers.length > 0
        ? sellers.reduce((sum, s) => sum + s.engagementRate, 0) / sellers.length
        : 0;

    return { totalLive, totalGMV, totalFollowers, avgEngagement };
  }, [sellers, liveNow]);

  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="relative px-4 py-8 sm:px-6 sm:py-10 md:px-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
                {stats.totalLive} Live Now
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                <Flame className="w-3.5 h-3.5 mr-1" />
                Live Commerce Hub
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Live Center</h1>
            <p className="text-lg text-white/90 mb-6">
              Discover top-performing live sellers with proven GMV. Watch streams, analyze
              performance, and connect with the best.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur">
                <p className="text-xl sm:text-2xl font-bold">{formatNumber(stats.totalGMV)}</p>
                <p className="text-xs sm:text-sm text-white/80">Total GMV</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur">
                <p className="text-xl sm:text-2xl font-bold">{formatNumber(sellers.length)}</p>
                <p className="text-xs sm:text-sm text-white/80">Live Sellers</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur">
                <p className="text-xl sm:text-2xl font-bold">{stats.avgEngagement.toFixed(1)}%</p>
                <p className="text-xs sm:text-sm text-white/80">Avg Engagement</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search live sellers by name or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-12">
            <TabsTrigger value="live" className="gap-2">
              <Radio className="w-4 h-4" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="top" className="gap-2">
              <Flame className="w-4 h-4" />
              Top Performers
            </TabsTrigger>
            <TabsTrigger value="rising" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Rising
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Based on Active Tab */}
      {sellersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Live Now Grid */}
          {activeTab === "live" && liveNow.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveNow.map((seller, i) => (
                  <motion.div
                    key={seller.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <LiveSellerCard seller={seller} isLive />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performers */}
          {activeTab === "top" && (
            <div className="space-y-6">
              {/* Top 3 Podium */}
              {topPerformers.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center pt-6 sm:pt-8">
                    <div className="relative">
                      <KOLAvatar
                        kol={topPerformers[1]}
                        size="xl"
                        ring
                        ringColor="ring-gray-300"
                        className="w-14 h-14 sm:w-20 sm:h-20"
                      />
                      <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700 text-xs sm:text-sm">
                        2
                      </div>
                    </div>
                    <p className="font-semibold mt-3 sm:mt-4 text-center text-xs sm:text-sm truncate max-w-[72px] xs:max-w-[90px] sm:max-w-none">
                      {topPerformers[1].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(topPerformers[1].avgLiveGMV || 0)}
                    </p>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2">
                        <CrownIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                      </div>
                      <KOLAvatar
                        kol={topPerformers[0]}
                        size="xl"
                        ring
                        ringColor="ring-yellow-400"
                        className="w-16 h-16 sm:w-24 sm:h-24"
                      />
                      <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-yellow-900 text-xs sm:text-sm">
                        1
                      </div>
                    </div>
                    <p className="font-semibold mt-3 sm:mt-4 text-center text-sm sm:text-lg truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                      {topPerformers[0].name}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-green-600">
                      {formatCurrency(topPerformers[0].avgLiveGMV || 0)}
                    </p>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center pt-8 sm:pt-10">
                    <div className="relative">
                      <KOLAvatar
                        kol={topPerformers[2]}
                        size="xl"
                        ring
                        ringColor="ring-orange-400"
                        className="w-12 h-12 sm:w-16 sm:h-16"
                      />
                      <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-400 flex items-center justify-center font-bold text-orange-900 text-xs">
                        3
                      </div>
                    </div>
                    <p className="font-semibold mt-3 sm:mt-4 text-center text-xs sm:text-sm truncate max-w-[72px] xs:max-w-[90px] sm:max-w-none">
                      {topPerformers[2].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(topPerformers[2].avgLiveGMV || 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Full List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topPerformers.map((seller, i) => (
                  <motion.div
                    key={seller.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CompactSellerCard seller={seller} rank={i + 1} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Rising Stars */}
          {activeTab === "rising" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {risingSellers.map((seller, i) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <LiveSellerCard seller={seller} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LiveSellerCard({
  seller,
  isLive = false,
}: {
  seller: ApiLiveSeller & { computedImageUrl?: string };
  isLive?: boolean;
}) {
  const router = useRouter();

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer">
      <div className="relative aspect-video">
        <Image
          src={seller.computedImageUrl || getKOLImageUrl(seller)}
          alt={seller.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-red-500 text-white border-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white mr-1" />
              LIVE
            </Badge>
            <Badge className="bg-black/50 text-white border-0 backdrop-blur">
              <Users className="w-3 h-3 mr-1" />
              {formatNumber(Math.floor(Math.random() * 5000) + 1000)}
            </Badge>
          </div>
        )}

        {/* Platform Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/50 text-white border-0 backdrop-blur">{seller.platform}</Badge>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg">{seller.name}</h3>
          <p className="text-sm text-white/80">@{seller.handle}</p>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-bold text-lg text-foreground">{formatNumber(seller.followers)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-bold text-lg text-green-600">
              {formatCurrency(seller.avgLiveGMV || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Avg GMV</p>
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">{seller.engagementRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={() => router.push(`/kols/${seller.id}`)}>
            View Profile
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactSellerCard({ seller, rank }: { seller: ApiLiveSeller; rank: number }) {
  const router = useRouter();

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all"
      onClick={() => router.push(`/kols/${seller.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {/* Rank */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
            rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : rank === 2
                ? "bg-gray-100 text-gray-700"
                : rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-muted text-muted-foreground"
          }`}
        >
          {rank}
        </div>

        {/* Avatar */}
        <KOLAvatar kol={seller} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{seller.name}</h4>
            {seller.isLiveNow && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{seller.handle}</p>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-muted-foreground">
              {formatNumber(seller.followers)} followers
            </span>
            <span className="text-green-600 font-medium">
              {formatCurrency(seller.avgLiveGMV || 0)} GMV
            </span>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
  );
}
