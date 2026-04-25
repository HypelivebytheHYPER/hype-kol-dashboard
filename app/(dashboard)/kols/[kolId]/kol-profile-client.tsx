"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatFeeRange, formatNumber, formatEngagement, numOrDash } from "@/lib/format";
import { ROUTES, RADAR_CEILINGS, ENGAGEMENT_COUNT_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { getTierColor } from "@/lib/tier";
import { VALUE_ACCENT } from "@/lib/design-tokens";
import {
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  ArrowLeft,
  Users,
  TrendingUp,
  Eye,
  Video,
  ShoppingBag,
  Star,
  Info,
} from "lucide-react";
import { TikTokProfileEmbed } from "@/components/tiktok-profile-embed";
import { TikTokVideoCarousel } from "@/components/tiktok-video-carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import type { Creator } from "@/lib/types/catalog";

const radarConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

const barConfig = {
  value: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;



interface KOLProfileClientProps {
  kol: Creator;
}

export function KOLProfileClient({ kol }: KOLProfileClientProps) {

  // Performance radar (normalised 0–100)
  const radarData = [
    { axis: "Followers", value: Math.min(100, (kol.followers / RADAR_CEILINGS.followers) * 100) },
    {
      axis: "Engagement",
      value: Math.min(
        100,
        kol.engagementRate > ENGAGEMENT_COUNT_THRESHOLD
          ? Math.min(kol.engagementRate / ENGAGEMENT_COUNT_THRESHOLD, 100)
          : kol.engagementRate * 10
      ),
    },
    { axis: "GMV", value: Math.min(100, ((kol.avgGMV || kol.avgLiveGMV) / RADAR_CEILINGS.gmv) * 100) },
    { axis: "Quality", value: (kol.qualityScore / RADAR_CEILINGS.quality) * 100 },
    {
      axis: "Content",
      value: Math.min(100, ((kol.stats.liveNum + kol.stats.videoNum) / RADAR_CEILINGS.content) * 100),
    },
    { axis: "Revenue", value: Math.min(100, (kol.stats.revenue / RADAR_CEILINGS.revenue) * 100) },
  ];

  // GMV breakdown bar
  const gmvBarData = [
    { label: "Avg GMV", value: kol.avgGMV || 0 },
    { label: "Avg Live", value: kol.avgLiveGMV || 0 },
    { label: "Live GMV", value: kol.stats.liveGmv || 0 },
    { label: "Video GMV", value: kol.stats.videoGmv || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Back */}
      <Link
        href={ROUTES.KOLS}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to KOLs
      </Link>

      {/* ── HERO CARD ── */}
      <Card className="overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
        </div>
        <CardContent className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative border-4 border-card shadow-xl size-24 rounded-full overflow-hidden bg-muted flex items-center justify-center text-2xl font-semibold">
                <span className="text-lg font-semibold">
                  {kol.name?.slice(0, 2).toUpperCase() || "?"}
                </span>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{kol.name}</h1>
                  <Badge className={`${getTierColor(kol.tier)} text-foreground border-0`}>
                    {kol.tier}
                  </Badge>
                  {kol.kolType && <Badge variant="outline">{kol.kolType}</Badge>}
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">@{kol.handle}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <Badge variant="outline" className="text-xs">
                    {kol.platform}
                  </Badge>
                  {kol.location && (
                    <Badge variant="outline" className="text-xs">
                      {kol.location}
                    </Badge>
                  )}
                  {kol.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {/* Social + action buttons */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
              {kol.channel && (
                <a href={kol.channel} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="size-3.5" />
                    Channel
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Account Type */}
          {kol.accountType && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex">
                    <Badge
                      variant={kol.accountType === "Main" ? "default" : "secondary"}
                      className="text-xs cursor-help"
                    >
                      {kol.accountType === "Main" && (
                        <Star className="size-3 fill-current mr-1" />
                      )}
                      {kol.accountType}
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {kol.accountType === "Main"
                      ? "Primary account for this KOL"
                      : kol.accountType === "Secondary"
                        ? "Secondary/backup channel"
                        : kol.accountType === "Backup"
                          ? "Backup account"
                          : "Sub-brand account"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* 6-col KPI row */}
          <TooltipProvider delay={300}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6 pt-5 border-t border-border">
              <KpiTile
                icon={<Users className="size-4" />}
                label="Followers"
                value={formatNumber(kol.followers)}
                hint="Total number of followers / subscribers on their primary platform."
              />
              <KpiTile
                icon={<TrendingUp className="size-4" />}
                label="Engagement"
                value={formatEngagement(kol.engagementRate)}
                hint={
                  kol.engagementRate > ENGAGEMENT_COUNT_THRESHOLD
                    ? "Total engagement interactions (likes + comments + shares). Shown as count because the raw rate exceeds 100."
                    : "Engagement rate = total interactions / followers. Industry avg is 1-3% for large accounts."
                }
              />
              <KpiTile
                icon={<ShoppingBag className="size-4" />}
                label="Avg GMV"
                value={numOrDash(kol.avgGMV, formatCurrency)}
                hint="Average Gross Merchandise Value generated per month across all content types."
              />
              <KpiTile
                icon={<Star className="size-4" />}
                label="Quality Score"
                value={kol.qualityScore > 0 ? `${kol.qualityScore.toFixed(1)} / 5` : "—"}
                hint={`Composite score out of 5 based on engagement consistency, GMV performance, and content output. ${
                  kol.qualityScore >= 4
                    ? "Excellent -- top tier performer."
                    : kol.qualityScore >= 3
                      ? "Good -- solid and reliable."
                      : kol.qualityScore >= 2
                        ? "Average -- room to grow."
                        : "Below average."
                }`}
              />
              <KpiTile
                icon={<Eye className="size-4" />}
                label="Total Views"
                value={numOrDash(kol.stats.views)}
                hint="Cumulative video/live views across all tracked content in the database."
              />
              <KpiTile
                icon={<Video className="size-4" />}
                label="Content Output"
                value={
                  `${kol.stats.liveNum > 0 ? `${kol.stats.liveNum} Live` : ""}${kol.stats.liveNum > 0 && kol.stats.videoNum > 0 ? " \u00b7 " : ""}${kol.stats.videoNum > 0 ? `${kol.stats.videoNum} Videos` : ""}` ||
                  "—"
                }
                hint={`L = Live sessions recorded. V = Short/long-form videos posted.${kol.stats.liveNum > 0 ? ` ${kol.stats.liveNum} live streams` : ""}${kol.stats.videoNum > 0 ? ` \u00b7 ${kol.stats.videoNum} video posts` : ""} tracked in this period.`}
              />
            </div>
          </TooltipProvider>

          {/* Rate-card band (Lark `Fee` field, aggregated across packages) */}
          {kol.fees && (
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Rate Card
              </span>
              <span className={cn("font-mono font-bold tabular-nums", VALUE_ACCENT)}>
                {formatFeeRange(kol.fees, " – ")}
              </span>
              <span className="text-xs text-muted-foreground">
                {kol.fees.count} {kol.fees.count === 1 ? "package" : "packages"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── TABS ── */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* ── ANALYTICS ── */}
        <TabsContent value="analytics" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main column: analytics content */}
            <div className="flex flex-col lg:col-span-2 gap-5">
              {/* Row 1: Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Total Revenue</CardTitle>
                    <p className="text-xs text-muted-foreground">Lifetime aggregate</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-3xl font-mono font-bold">
                      {numOrDash(kol.stats.revenue, formatCurrency)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Total Views</CardTitle>
                    <p className="text-xs text-muted-foreground">Lifetime aggregate</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-3xl font-mono font-bold">
                      {numOrDash(kol.stats.views)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: GMV breakdown + Performance radar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">GMV Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gmvBarData.length > 0 ? (
                      <ChartContainer config={barConfig} className="h-56 w-full">
                        <BarChart data={gmvBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                          <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                          />
                          <XAxis
                            type="number"
                            fontSize={10}
                            tickFormatter={(v) => formatCurrency(v)}
                            tick={{ fill: "var(--muted-foreground)" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={80}
                            fontSize={11}
                            tick={{ fill: "var(--muted-foreground)" }}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />
                            }
                          />
                          <Bar
                            dataKey="value"
                            fill="var(--chart-1)"
                            radius={[0, 4, 4, 0]}
                            barSize={28}
                          />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <EmptyChart label="No GMV data" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Performance Profile</CardTitle>
                    <p className="text-xs text-muted-foreground">Normalised across 6 dimensions</p>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={radarConfig} className="h-44 sm:h-56 w-full">
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        />
                        <Radar
                          dataKey="value"
                          stroke="var(--chart-1)"
                          fill="var(--chart-1)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                          dot={{ r: 3, fill: "var(--chart-1)" }}
                        />
                      </RadarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Full stats grid */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Full Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatTile
                      label="Total Revenue"
                      value={numOrDash(kol.stats.revenue, formatCurrency)}
                    />
                    <StatTile
                      label="Live GMV"
                      value={numOrDash(kol.stats.liveGmv, formatCurrency)}
                    />
                    <StatTile
                      label="Video GMV"
                      value={numOrDash(kol.stats.videoGmv, formatCurrency)}
                    />
                    <StatTile
                      label="Avg Monthly GMV"
                      value={numOrDash(kol.avgGMV, formatCurrency)}
                    />
                    <StatTile
                      label="Total Views"
                      value={numOrDash(kol.stats.views)}
                    />
                    <StatTile
                      label="Products Promoted"
                      value={numOrDash(kol.stats.productCount, String)}
                    />
                    <StatTile
                      label="Live Sessions"
                      value={numOrDash(kol.stats.liveNum, String)}
                    />
                    <StatTile
                      label="Videos"
                      value={numOrDash(kol.stats.videoNum, String)}
                    />
                  </div>
                  {kol.bio?.th && (
                    <div className="mt-5 pt-5 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1.5">About</p>
                      <p className="text-sm">{kol.bio.th}</p>
                      {kol.bio.en && <p className="text-sm text-muted-foreground mt-1">{kol.bio.en}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: social preview */}
            <div className="flex flex-col lg:col-span-1 gap-5">
              {kol.platform?.toLowerCase().includes("tiktok") && kol.handle && (
                <>
                  <TikTokProfileEmbed handle={kol.handle} name={kol.name} />
                  <TikTokVideoCarousel handle={kol.handle} />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── CONTACT ── */}
        <TabsContent value="contact" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {kol.contact.lineId?.trim() && (
                <ContactRow
                  icon={<MessageCircle className="size-4 text-chart-2" />}
                  label="LINE ID"
                  value={kol.contact.lineId}
                  href={`https://line.me/ti/p/~${encodeURIComponent(kol.contact.lineId)}`}
                  isExternal
                />
              )}
              {kol.contact.phone?.trim() && (
                <ContactRow
                  icon={<Phone className="size-4" />}
                  label="Phone"
                  value={kol.contact.phone}
                  href={`tel:${kol.contact.phone.replace(/\s/g, "")}`}
                />
              )}
              {kol.contact.email?.trim() && (
                <ContactRow
                  icon={<Mail className="size-4" />}
                  label="Email"
                  value={kol.contact.email}
                  href={`mailto:${kol.contact.email}`}
                />
              )}
              {kol.channel && (
                <ContactRow
                  icon={<ExternalLink className="size-4" />}
                  label="Channel"
                  value={kol.channel}
                  href={kol.channel}
                  isExternal
                />
              )}

              {!kol.contact.lineId?.trim() &&
                !kol.contact.phone?.trim() &&
                !kol.contact.email?.trim() &&
                !kol.channel && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No contact information on file
                  </p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Sub-components ── */

function KpiTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
        {hint && (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex cursor-help" />}>
              <Info className="size-3 shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
              {hint}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-xl font-bold font-mono tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40">
      <p className="text-lg font-bold font-mono tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  isExternal,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  isExternal?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-sm text-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-mono">{value}</p>
        )}
      </div>
    </div>
  );
}


