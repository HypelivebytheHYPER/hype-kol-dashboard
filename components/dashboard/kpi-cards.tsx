"use client";

import type { DashboardMetric } from "@/lib/types/catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { TREND } from "@/lib/design-tokens";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Eye,
  ShoppingCart,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  total_creators: Users,
  total_followers: Users,
  avg_quality: Eye,
  total_gmv: DollarSign,
  net_gmv: DollarSign,
  live_gmv: DollarSign,
  video_gmv: DollarSign,
  commission: DollarSign,
  total_revenue: DollarSign,
  roas: BarChart3,
  cpa: DollarSign,
  conversion_rate: BarChart3,
  total_products: ShoppingCart,
  active_campaigns: ShoppingCart,
  avg_engagement: Eye,
  engagement_rate: Eye,
  avg_likes: Eye,
  avg_comments: Users,
  avg_shares: TrendingDown,
  avg_saves: ShoppingCart,
};

function formatValue(value: number, unit: string): string {
  if (unit === "THB") return `฿${value >= 1_000_000 ? (value / 1_000_000).toFixed(1) + "M" : value >= 1_000 ? (value / 1_000).toFixed(0) + "K" : value.toString()}`;
  if (unit === "%") return `${value}%`;
  if (unit === "x") return `${value}x`;
  if (unit === "count" || unit === "") return value >= 1_000_000 ? (value / 1_000_000).toFixed(1) + "M" : value >= 1_000 ? (value / 1_000).toFixed(1) + "K" : value.toString();
  return `${value} ${unit}`;
}

function formatChange(change: number, unit: string): string {
  const prefix = change >= 0 ? "+" : "";
  if (unit === "x") return `${prefix}${change}x`;
  if (unit === "%" || unit === "THB" || unit === "count") return `${prefix}${change}%`;
  return `${prefix}${change}`;
}

interface KpiCardsProps {
  metrics: DashboardMetric[];
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const displayMetrics = metrics.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayMetrics.map((metric) => {
        const Icon = ICON_MAP[metric.metricKey] ?? BarChart3;
        const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
        const trendColor =
          metric.trend === "up"
            ? TREND.up
            : metric.trend === "down"
              ? TREND.down
              : TREND.neutral;

        return (
          <Card key={metric.metricKey} size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {metric.metricLabel}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {formatValue(metric.metricValue, metric.metricUnit)}
              </div>
              <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                <TrendIcon className="size-3" />
                <span>{formatChange(metric.change, metric.metricUnit)}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
