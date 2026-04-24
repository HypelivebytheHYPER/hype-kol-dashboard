"use client";

import { useMemo, useState } from "react";
import type { DashboardMetric } from "@/lib/types/catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { TREND, TREND_CHIP } from "@/lib/design-tokens";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, TrendingUp, TrendingDown, X } from "lucide-react";

type SortKey = "metricLabel" | "metricValue" | "change" | "trend";
type SortDir = "asc" | "desc";



const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: X,
};

function formatValue(value: number, unit: string): string {
  if (unit === "THB") return `฿${value >= 1_000_000 ? (value / 1_000_000).toFixed(1) + "M" : value >= 1_000 ? (value / 1_000).toFixed(0) + "K" : value.toString()}`;
  if (unit === "%") return `${value}%`;
  if (unit === "x") return `${value}x`;
  if (unit === "count" || unit === "") return value >= 1_000_000 ? (value / 1_000_000).toFixed(1) + "M" : value >= 1_000 ? (value / 1_000).toFixed(1) + "K" : value.toString();
  return `${value} ${unit}`;
}

function exportToCSV(metrics: DashboardMetric[]) {
  const headers = ["Period", "Dashboard Type", "Metric Key", "Metric Label", "Value", "Unit", "Change (%)", "Trend"];
  const rows = metrics.map((m) => [
    m.period,
    m.dashboardType,
    m.metricKey,
    m.metricLabel,
    String(m.metricValue),
    m.metricUnit,
    String(m.change),
    m.trend,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-metrics-${metrics[0]?.period ?? "export"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface DataTableSectionProps {
  metrics: DashboardMetric[];
}

export function DataTableSection({ metrics }: DataTableSectionProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("metricValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetric | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let data = [...metrics];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.metricLabel.toLowerCase().includes(q) ||
          m.metricKey.toLowerCase().includes(q) ||
          m.metricUnit.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "metricLabel":
          return dir * a.metricLabel.localeCompare(b.metricLabel);
        case "metricValue":
          return dir * (a.metricValue - b.metricValue);
        case "change":
          return dir * (a.change - b.change);
        case "trend": {
          const order = { up: 3, neutral: 2, down: 1 };
          return dir * (order[a.trend] - order[b.trend]);
        }
        default:
          return 0;
      }
    });

    return data;
  }, [metrics, search, sortKey, sortDir]);

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="size-3 text-muted-foreground opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3 text-foreground" />
    ) : (
      <ArrowDown className="size-3 text-foreground" />
    );
  };

  const HeaderCell = ({ colKey, label, className }: { colKey: SortKey; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(colKey)}
      className={cn(
        "flex items-center gap-1 pb-3 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {label}
      <SortIcon colKey={colKey} />
    </button>
  );

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          No metrics available
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Metrics</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search metrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full pl-9 text-sm sm:w-[200px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportToCSV(filteredAndSorted)}
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <HeaderCell colKey="metricLabel" label="Metric" className="min-w-[160px]" />
                  <HeaderCell colKey="metricValue" label="Value" className="min-w-[100px]" />
                  <HeaderCell colKey="change" label="Change" className="min-w-[100px]" />
                  <HeaderCell colKey="trend" label="Trend" className="min-w-[80px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSorted.map((row) => {
                  const TrendIcon = TREND_ICONS[row.trend];
                  return (
                    <tr
                      key={row.metricKey}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedMetric(row)}
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium">{row.metricLabel}</div>
                        <div className="text-xs text-muted-foreground">{row.metricKey}</div>
                      </td>
                      <td className="py-3 pr-4 font-medium tabular-nums">
                        {formatValue(row.metricValue, row.metricUnit)}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        <span
                          className={cn(
                            row.change >= 0 ? TREND.up : TREND.down
                          )}
                        >
                          {row.change >= 0 ? "+" : ""}
                          {row.change}%
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={cn("gap-1 text-xs font-medium", TREND_CHIP[row.trend])}
                        >
                          <TrendIcon className="size-3" />
                          {row.trend}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
              No metrics match your search
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filteredAndSorted.length} of {metrics.length} metrics
            </span>
            <span>Period: {metrics[0]?.period ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Metric Detail Modal */}
      <Dialog open={selectedMetric !== null} onOpenChange={(open) => !open && setSelectedMetric(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMetric?.metricLabel}</DialogTitle>
            <DialogDescription>
              {selectedMetric?.metricKey} • {selectedMetric?.period}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Value</span>
              <span className="text-xl font-bold tabular-nums">
                {selectedMetric && formatValue(selectedMetric.metricValue, selectedMetric.metricUnit)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Change vs Last Period</span>
              <span className={cn(
                "text-sm font-medium tabular-nums",
                selectedMetric && selectedMetric.change >= 0 ? TREND.up : TREND.down
              )}>
                {selectedMetric && `${selectedMetric.change >= 0 ? "+" : ""}${selectedMetric.change}%`}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Trend</span>
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1 text-xs font-medium",
                  selectedMetric && TREND_CHIP[selectedMetric.trend]
                )}
              >
                {selectedMetric?.trend}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Dashboard Type</span>
              <span className="text-sm font-medium capitalize">
                {selectedMetric?.dashboardType}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Period</span>
              <span className="text-sm font-medium">
                {selectedMetric?.period}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
