"use client";

import { useMemo, useState } from "react";
import type { DashboardMetric } from "@/lib/types/catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const TREND_COLORS = {
  up: "hsl(var(--chart-2))",
  down: "hsl(var(--destructive))",
  neutral: "hsl(var(--chart-5))",
};

interface ChartSectionProps {
  history: DashboardMetric[];
}

export function ChartSection({ history }: ChartSectionProps) {
  const [activeMetricKey, setActiveMetricKey] = useState<string | null>(null);

  // Group history by period for trend chart
  const trendData = useMemo(() => {
    if (history.length === 0) return [];

    // Get unique periods sorted
    const periods = Array.from(new Set(history.map((h) => h.period))).sort();

    // Get unique metric keys
    const metricKeys = Array.from(new Set(history.map((h) => h.metricKey)));

    // Build rows: one per period, columns are metric values
    return periods.map((period) => {
      const row: Record<string, number | string> = { period };
      for (const key of metricKeys) {
        const metric = history.find((h) => h.period === period && h.metricKey === key);
        if (metric) {
          row[key] = metric.metricValue;
        }
      }
      return row;
    });
  }, [history]);

  // Comparison data for current period (latest)
  const comparisonData = useMemo(() => {
    if (history.length === 0) return [];

    // Find the latest period
    const periods = Array.from(new Set(history.map((h) => h.period))).sort();
    const latestPeriod = periods[periods.length - 1];

    return history
      .filter((h) => h.period === latestPeriod)
      .map((m) => ({
        name: m.metricLabel,
        key: m.metricKey,
        value: m.metricValue,
        unit: m.metricUnit,
        trend: m.trend,
        change: m.change,
      }));
  }, [history]);

  // Build chart config from metric keys
  const chartConfig: ChartConfig = useMemo(() => {
    const keys = Array.from(new Set(history.map((h) => h.metricKey)));
    return keys.reduce((acc, key, i) => {
      const metric = history.find((h) => h.metricKey === key);
      acc[key] = {
        label: metric?.metricLabel ?? key,
        theme: {
          light: `hsl(var(--chart-${(i % 5) + 1}))`,
          dark: `hsl(var(--chart-${(i % 5) + 1}))`,
        },
      };
      return acc;
    }, {} as ChartConfig);
  }, [history]);

  // Get metric keys for the active metric's trend line
  const activeMetric = useMemo(() => {
    if (!activeMetricKey) return null;
    return history.find((h) => h.metricKey === activeMetricKey);
  }, [history, activeMetricKey]);

  if (history.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metric Comparison</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No metrics available
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trend History</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No metrics available
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Metric Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  formatter={(value: number, _name: string, props: { payload?: { unit: string; change: number; trend: string } }) => {
                    const p = props.payload;
                    if (!p) return [String(value), ""];
                    const formatted = p.unit === "THB"
                      ? `฿${Number(value).toLocaleString()}`
                      : p.unit === "%"
                        ? `${value}%`
                        : `${value} ${p.unit}`;
                    return [formatted, `Change: ${p.change >= 0 ? "+" : ""}${p.change}% (${p.trend})`];
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => {
                    if (data && typeof data === "object" && "key" in data) {
                      setActiveMetricKey(String(data.key));
                    }
                  }}
                  cursor="pointer"
                >
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TREND_COLORS[entry.trend]}
                      opacity={activeMetricKey === null || activeMetricKey === entry.key ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Click a bar to view its trend history
          </p>
        </CardContent>
      </Card>

      {/* Trend History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trend History</CardTitle>
          {activeMetricKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMetricKey(null)}
              className="h-7 text-xs"
            >
              Reset
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey={activeMetricKey ?? comparisonData[0]?.key}
                  strokeWidth={2}
                  fillOpacity={0.15}
                  fill={`var(--color-${activeMetricKey ?? comparisonData[0]?.key})`}
                  stroke={`var(--color-${activeMetricKey ?? comparisonData[0]?.key})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {activeMetric
              ? `Showing history for: ${activeMetric.metricLabel}`
              : comparisonData[0]
                ? `Showing history for: ${comparisonData[0].name}`
                : "Select a metric"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
