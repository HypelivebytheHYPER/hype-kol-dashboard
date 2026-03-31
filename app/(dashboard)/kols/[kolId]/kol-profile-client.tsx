"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KOLAvatar } from "@/components/ui/premium-avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
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
import { formatCurrency, formatNumber, getTierColor } from "@/lib/utils";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import type { ApiKOL } from "@/lib/lark-api";

const areaConfig = {
  value: { label: "Value", color: "var(--chart-1)" },
} satisfies ChartConfig;

const radarConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

const barConfig = {
  value: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Normalise engagement: if raw value > 100 it's a count, not a % */
function fmtEngagement(rate: number): string {
  if (rate > 100) return formatNumber(rate);
  return `${rate.toFixed(2)}%`;
}

/** Build a 6-point simulated trend from a single total — evenly distributed with slight curve */
function buildTrend(total: number, points = 6) {
  if (total <= 0) return [];
  const base = total / points;
  const weights = [0.55, 0.7, 0.8, 0.9, 1.05, 1.0];
  return weights.map((w, i) => ({
    month: `M${i + 1}`,
    value: Math.round(base * w),
  }));
}

interface KOLProfileClientProps {
  kol: ApiKOL;
  related: { parent: ApiKOL | null; children: ApiKOL[] };
}

export function KOLProfileClient({ kol, related }: KOLProfileClientProps) {
  // Trend charts
  const revenueTrend = buildTrend(kol.stats.revenue);
  const viewsTrend = buildTrend(kol.stats.views);

  // Performance radar (normalised 0–100)
  const maxFollowers = 5_000_000;
  const radarData = [
    { axis: "Followers", value: Math.min(100, (kol.followers / maxFollowers) * 100) },
    {
      axis: "Engagement",
      value: Math.min(
        100,
        kol.engagementRate > 100 ? Math.min(kol.engagementRate / 100, 100) : kol.engagementRate * 10
      ),
    },
    { axis: "GMV", value: Math.min(100, ((kol.avgGMV || kol.avgLiveGMV) / 5_000_000) * 100) },
    { axis: "Quality", value: (kol.qualityScore / 5) * 100 },
    {
      axis: "Content",
      value: Math.min(100, ((kol.stats.liveNum + kol.stats.videoNum) / 50) * 100),
    },
    { axis: "Revenue", value: Math.min(100, (kol.stats.revenue / 30_000_000) * 100) },
  ];

  // GMV breakdown bar
  const gmvBarData = [
    { label: "Avg GMV", value: kol.avgGMV || 0 },
    { label: "Avg Live", value: kol.avgLiveGMV || 0 },
    { label: "Live GMV", value: kol.stats.liveGmv || 0 },
    { label: "Video GMV", value: kol.stats.videoGmv || 0 },
  ].filter((d) => d.value > 0);

  const parentKol = related?.parent;
  const childKols = related?.children || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Back */}
      <Link
        href="/kols"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
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
              <KOLAvatar
                kol={kol}
                size="xl"
                className="border-4 border-card shadow-xl w-24 h-24 text-2xl"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{kol.name}</h1>
                  <Badge className={`${getTierColor(kol.tier)} text-white border-0`}>
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
                    <ExternalLink className="w-3.5 h-3.5" />
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
                        <Star className="w-3 h-3 fill-current mr-1" />
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
                icon={<Users className="w-4 h-4" />}
                label="Followers"
                value={formatNumber(kol.followers)}
                hint="Total number of followers / subscribers on their primary platform."
              />
              <KpiTile
                icon={<TrendingUp className="w-4 h-4" />}
                label="Engagement"
                value={fmtEngagement(kol.engagementRate)}
                hint={
                  kol.engagementRate > 100
                    ? "Total engagement interactions (likes + comments + shares). Shown as count because the raw rate exceeds 100."
                    : "Engagement rate = total interactions / followers. Industry avg is 1-3% for large accounts."
                }
              />
              <KpiTile
                icon={<ShoppingBag className="w-4 h-4" />}
                label="Avg GMV"
                value={kol.avgGMV > 0 ? formatCurrency(kol.avgGMV) : "---"}
                hint="Average Gross Merchandise Value generated per month across all content types."
              />
              <KpiTile
                icon={<Star className="w-4 h-4" />}
                label="Quality Score"
                value={kol.qualityScore > 0 ? `${kol.qualityScore.toFixed(1)} / 5` : "---"}
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
                icon={<Eye className="w-4 h-4" />}
                label="Total Views"
                value={kol.stats.views > 0 ? formatNumber(kol.stats.views) : "---"}
                hint="Cumulative video/live views across all tracked content in the database."
              />
              <KpiTile
                icon={<Video className="w-4 h-4" />}
                label="Content Output"
                value={
                  `${kol.stats.liveNum > 0 ? `${kol.stats.liveNum} Live` : ""}${kol.stats.liveNum > 0 && kol.stats.videoNum > 0 ? " \u00b7 " : ""}${kol.stats.videoNum > 0 ? `${kol.stats.videoNum} Videos` : ""}` ||
                  "---"
                }
                hint={`L = Live sessions recorded. V = Short/long-form videos posted.${kol.stats.liveNum > 0 ? ` ${kol.stats.liveNum} live streams` : ""}${kol.stats.videoNum > 0 ? ` \u00b7 ${kol.stats.videoNum} video posts` : ""} tracked in this period.`}
              />
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* ── TABS ── */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* ── ANALYTICS ── */}
        <TabsContent value="analytics" className="mt-5 space-y-5">
          {/* Row 1: Revenue trend + Views trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">Estimated period trend</p>
              </CardHeader>
              <CardContent>
                {revenueTrend.length > 0 ? (
                  <ChartContainer config={areaConfig} className="h-44 w-full">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        fontSize={10}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => formatCurrency(v)}
                        width={65}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />
                        }
                      />
                      <Area
                        dataKey="value"
                        stroke="var(--chart-1)"
                        fill="url(#revGrad)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <EmptyChart label="No revenue data" />
                )}
                <div className="flex justify-between text-xs mt-2 px-1">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-mono font-bold">
                    {kol.stats.revenue > 0 ? formatCurrency(kol.stats.revenue) : "---"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Views Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Estimated period trend</p>
              </CardHeader>
              <CardContent>
                {viewsTrend.length > 0 ? (
                  <ChartContainer
                    config={{ value: { label: "Views", color: "var(--chart-2)" } }}
                    className="h-44 w-full"
                  >
                    <AreaChart data={viewsTrend}>
                      <defs>
                        <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        fontSize={10}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => formatNumber(v)}
                        width={55}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v) => formatNumber(Number(v))} />}
                      />
                      <Area
                        dataKey="value"
                        stroke="var(--chart-2)"
                        fill="url(#viewGrad)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <EmptyChart label="No views data" />
                )}
                <div className="flex justify-between text-xs mt-2 px-1">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-mono font-bold">
                    {kol.stats.views > 0 ? formatNumber(kol.stats.views) : "---"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: GMV breakdown bar + Performance radar */}
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
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        fontSize={10}
                        tickFormatter={(v) => formatCurrency(v)}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={80}
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
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
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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

          {/* Row 3: all stats grid */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Full Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatTile
                  label="Total Revenue"
                  value={kol.stats.revenue > 0 ? formatCurrency(kol.stats.revenue) : "---"}
                />
                <StatTile
                  label="Live GMV"
                  value={kol.stats.liveGmv > 0 ? formatCurrency(kol.stats.liveGmv) : "---"}
                />
                <StatTile
                  label="Video GMV"
                  value={kol.stats.videoGmv > 0 ? formatCurrency(kol.stats.videoGmv) : "---"}
                />
                <StatTile
                  label="Avg Monthly GMV"
                  value={kol.avgGMV > 0 ? formatCurrency(kol.avgGMV) : "---"}
                />
                <StatTile
                  label="Total Views"
                  value={kol.stats.views > 0 ? formatNumber(kol.stats.views) : "---"}
                />
                <StatTile
                  label="Products Promoted"
                  value={kol.stats.productCount > 0 ? String(kol.stats.productCount) : "---"}
                />
                <StatTile
                  label="Live Sessions"
                  value={kol.stats.liveNum > 0 ? String(kol.stats.liveNum) : "---"}
                />
                <StatTile
                  label="Videos"
                  value={kol.stats.videoNum > 0 ? String(kol.stats.videoNum) : "---"}
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

          {/* Linked Accounts */}
          <LinkedAccountsSection parentKol={parentKol} childKols={childKols} />
        </TabsContent>

        {/* ── CONTACT ── */}
        <TabsContent value="contact" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {kol.contact.lineId?.trim() && (
                <ContactRow
                  icon={<MessageCircle className="w-4 h-4 text-green-500" />}
                  label="LINE ID"
                  value={kol.contact.lineId}
                />
              )}
              {kol.contact.phone?.trim() && (
                <ContactRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={kol.contact.phone}
                />
              )}
              {kol.contact.email?.trim() && (
                <ContactRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={kol.contact.email}
                />
              )}
              {kol.channel && (
                <ContactRow
                  icon={<ExternalLink className="w-4 h-4" />}
                  label="Channel"
                  value={kol.channel}
                  isLink
                />
              )}
              {kol.sourceUrl && (
                <ContactRow
                  icon={<ExternalLink className="w-4 h-4" />}
                  label="Source"
                  value={kol.sourceUrl}
                  isLink
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
              <Info className="w-3 h-3 shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
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
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
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

function LinkedAccountsSection({
  parentKol,
  childKols,
}: {
  parentKol: ApiKOL | null;
  childKols: ApiKOL[];
}) {
  // Don't show section if no relationships
  if (!parentKol && childKols.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Linked Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Show parent if this is a child account */}
          {parentKol && (
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Parent Account</p>
              <Link
                href={`/kols/${parentKol.id}`}
                className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
              >
                <KOLAvatar kol={parentKol} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{parentKol.name}</p>
                  <p className="text-xs text-muted-foreground">@{parentKol.handle}</p>
                </div>
                <Badge variant="default" className="text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Main
                </Badge>
              </Link>
            </div>
          )}

          {/* Show children if this is a main account */}
          {childKols.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">
                Secondary Accounts ({childKols.length})
              </p>
              <div className="space-y-2">
                {childKols.map((child: ApiKOL) => (
                  <Link
                    key={child.id}
                    href={`/kols/${child.id}`}
                    className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <KOLAvatar kol={child} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{child.name}</p>
                      <p className="text-xs text-muted-foreground">@{child.handle}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {child.accountType || "Linked"}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

