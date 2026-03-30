"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  Radio,
  Sparkles,
  Crown,
  Users,
  ArrowRight,
  Play,
  Star,
  Zap,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SmoothCarousel, CarouselItem } from "@/components/ui/smooth-carousel";
import { KOLAvatar } from "@/components/ui/premium-avatar";
import { getKOLImageUrl } from "@/lib/lark-api";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { getRecentSearches } from "@/lib/smart-search";
import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";
import { CATEGORIES } from "@/lib/config/categories";

interface KOL {
  id: string;
  name: string;
  handle: string;
  tier?: string;
  followers?: number;
  avgGMV?: number;
  avgLiveGMV?: number;
  engagementRate: number;
  isLiveNow?: boolean;
  categories?: string[];
  computedImageUrl?: string;
  imageUrl?: string;
  platform?: string;
}

interface InitialData {
  kols: { data: KOL[]; total: number };
  sellers: { data: KOL[]; total: number };
  categories: {
    beauty: { data: KOL[]; total: number };
    tech: { data: KOL[]; total: number };
    fashion: { data: KOL[]; total: number };
    food: { data: KOL[]; total: number };
  };
}

export default function DiscoveryHubClient({ initialData }: { initialData: InitialData }) {
  const router = useRouter();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Use server-fetched data immediately (no loading state!)
  const kols = initialData.kols?.data || [];
  const sellers = initialData.sellers?.data || [];

  // Load recent searches client-side
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Get category-specific KOLs from server data
  const categoryKOLs = useMemo(
    () => ({
      beauty: initialData.categories.beauty?.data || kols.filter((k) => k.categories?.includes("beauty")),
      tech: initialData.categories.tech?.data || kols.filter((k) => k.categories?.includes("tech")),
      fashion: initialData.categories.fashion?.data || kols.filter((k) => k.categories?.includes("fashion")),
      food: initialData.categories.food?.data || kols.filter((k) => k.categories?.includes("food")),
      lifestyle: kols.filter((k) => k.categories?.includes("lifestyle")),
      health: kols.filter((k) => k.categories?.includes("health")),
    }),
    [initialData.categories, kols]
  );

  // Featured KOLs - top by GMV
  const featuredKOLs = useMemo(() => {
    return [...kols].sort((a, b) => (b.avgGMV || 0) - (a.avgGMV || 0)).slice(0, 4);
  }, [kols]);

  // Top live sellers
  const topLiveSellers = useMemo(() => {
    return [...sellers].sort((a, b) => (b.avgLiveGMV || 0) - (a.avgLiveGMV || 0)).slice(0, 6);
  }, [sellers]);

  // Rising stars
  const risingStars = useMemo(() => {
    return [...kols]
      .filter((k) => k.followers && k.followers >= 50000 && k.followers <= 500000)
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 4);
  }, [kols]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kols?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-background border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 md:px-12 md:py-16">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t("hero.badgePlatform")}
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                {sellers.filter((s) => s.isLiveNow).length} {t("hero.liveNow")}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              {t("hero.description", { count: formatNumber(initialData.kols?.total || 0) })}
            </p>

            {/* Smart Search */}
            <form onSubmit={handleSearch} className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t("hero.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 sm:h-14 pl-12 pr-20 sm:pr-32 text-base rounded-2xl border-2 border-primary/20 focus:border-primary shadow-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
                size="sm"
              >
                <span className="hidden sm:inline">{t("common.search")}</span>
                <Search className="w-4 h-4 sm:hidden" />
              </Button>
            </form>

            {/* Quick suggestions */}
            {recentSearches.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">{t("hero.recentSearches")}:</span>
                {recentSearches.slice(0, 3).map((search) => (
                  <button
                    key={search}
                    onClick={() => router.push(`/kols?q=${encodeURIComponent(search)}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t("categories.browseBy")}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/kols")}>
            <span className="hidden sm:inline">{t("common.viewAll")}</span>
            <ArrowRight className="w-4 h-4 sm:ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/kols?category=${cat.id}`)}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all hover:shadow-lg animate-in fade-in duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div className="relative">
                <cat.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 block" />
                <p className="font-medium text-xs sm:text-sm leading-tight">{cat.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Category-specific KOLs with Smooth Carousel */}
      <section className="space-y-10">
        {CATEGORIES.filter(
          (cat) => categoryKOLs[cat.id as keyof typeof categoryKOLs]?.length > 0
        ).map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <cat.icon className="w-5 h-5" />
                <h2 className="text-lg font-semibold">{cat.name}</h2>
                <Badge variant="secondary" className="ml-2">
                  {categoryKOLs[cat.id as keyof typeof categoryKOLs]?.length || 0} KOLs
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/kols?category=${cat.id}`)}
              >
                {t("common.viewAll")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <SmoothCarousel itemWidth={240} gap={16}>
              {categoryKOLs[cat.id as keyof typeof categoryKOLs]?.map(
                (kol) => (
                  <CarouselItem key={kol.id} width={240}>
                    <div
                      onClick={() => router.push(`/kols/${kol.id}`)}
                      className="group cursor-pointer p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/20 transition-all h-full"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <KOLAvatar
                          kol={kol}
                          size="lg"
                          ring
                          ringColor="ring-primary/20 group-hover:ring-primary"
                          className="transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {kol.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">@{kol.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(kol.followers || 0)}
                        </span>
                        {kol.avgGMV ? (
                          <span className="font-medium text-green-600">
                            {formatCurrency(kol.avgGMV)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                      {kol.isLiveNow && (
                        <Badge className="text-[10px] bg-red-500 text-white animate-pulse">
                          <Radio className="w-2 h-2 mr-1" />
                          {t("common.live")}
                        </Badge>
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </SmoothCarousel>
          </div>
        ))}
      </section>

      {/* Featured KOLs - Top Performers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold">{t("sections.topPerformers")}</h2>
            <Badge variant="secondary">{t("sections.byGmv")}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/kols?sort=gmv")}>
            {t("common.seeAll")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <SmoothCarousel itemWidth={280} gap={16}>
          {featuredKOLs.map((kol, index) => (
            <CarouselItem key={kol.id} width={280}>
              <div
                onClick={() => router.push(`/kols/${kol.id}`)}
                className="group cursor-pointer relative overflow-hidden rounded-xl border bg-card hover:shadow-xl transition-all h-full"
              >
                <div className="aspect-[4/3] relative bg-muted">
                  <Image
                    src={
                      kol.computedImageUrl ||
                      getKOLImageUrl({
                        imageUrl: kol.imageUrl,
                        handle: kol.handle,
                        platform: kol.platform,
                      })
                    }
                    alt={kol.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 280px"
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                    quality={index < 2 ? 85 : 75}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-primary text-white text-xs px-2 py-0.5">
                      <Crown className="w-3 h-3 mr-1" />
                      {kol.tier?.replace(" KOL", "")}
                    </Badge>
                    {kol.isLiveNow && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1" />
                        {t("common.live")}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg truncate">{kol.name}</h3>
                    <p className="text-sm text-white/80 truncate">@{kol.handle}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(kol.followers || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {formatCurrency(kol.avgGMV || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </SmoothCarousel>
      </section>

      {/* Live Sellers Section */}
      <section className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                {t("sections.liveCommerceStars")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("sections.liveCommerceDescription")}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/live")} size="sm" className="w-full sm:w-auto">
            <Play className="w-4 h-4 mr-2" />
            {t("sections.viewLiveCenter")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {topLiveSellers.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/kols/${seller.id}`)}
              className="group cursor-pointer flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-black/20 border hover:shadow-lg transition-all"
            >
              <div className="relative shrink-0">
                <KOLAvatar
                  kol={seller}
                  size="xl"
                  ring
                  ringColor="ring-red-500/20"
                />
                {seller.isLiveNow && (
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base truncate">{seller.name}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  @{seller.handle}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {seller.platform}
                  </Badge>
                  <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                    {formatCurrency(seller.avgLiveGMV || 0)} avg
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rising Stars */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <h2 className="text-lg sm:text-xl font-semibold">{t("sections.risingStars")}</h2>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {t("sections.highEngagement")}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/kols?sort=engagement")}>
            <span className="hidden sm:inline">{t("common.discoverMore")}</span>
            <span className="sm:hidden">{t("common.more")}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {risingStars.map((kol, i) => (
            <motion.div
              key={kol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(`/kols/${kol.id}`)}
              className="group cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <KOLAvatar kol={kol} size="lg" ring ringColor="ring-yellow-500/20" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{kol.name}</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">@{kol.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted">
                  <p className="font-mono font-bold text-primary text-sm sm:text-base">
                    {kol.engagementRate.toFixed(1)}%
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Engagement</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <p className="font-mono font-bold text-sm sm:text-base">
                    {formatNumber(kol.followers || 0)}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Followers</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {kol.categories?.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-[9px] sm:text-[10px]">
                    {cat}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Footer */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-6 sm:py-8 border-t">
        {[
          { label: t("stats.totalKols"), value: formatNumber(initialData.kols?.total || 0), icon: Users },
          {
            label: t("stats.liveSellers"),
            value: formatNumber(initialData.sellers?.total || 0),
            icon: Radio,
          },
          {
            label: t("stats.avgGmv"),
            value: formatCurrency(
              kols.length > 0 ? kols.reduce((s, k) => s + (k.avgGMV || 0), 0) / kols.length : 0
            ),
            icon: TrendingUp,
          },
          { label: t("stats.categories"), value: "15+", icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2 sm:p-0">
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-primary" />
            <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
