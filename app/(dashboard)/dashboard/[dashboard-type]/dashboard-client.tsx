"use client";

import { useRouter } from "next/navigation";
import { dashboardPath, type DashboardType, DASHBOARD_TYPES } from "@/lib/constants";
import type { DashboardMetric } from "@/lib/types/catalog";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ChartSection } from "@/components/dashboard/chart-section";
import { DataTableSection } from "@/components/dashboard/data-table-section";

const TYPE_LABELS: Record<DashboardType, string> = {
  overview: "Overview",
  performance: "Performance",
  gmv: "GMV & Revenue",
  engagement: "Engagement",
};

const TYPE_DESCRIPTIONS: Record<DashboardType, string> = {
  overview: "High-level KPIs and trends across all channels.",
  performance: "Campaign and channel performance metrics.",
  gmv: "Revenue attribution and GMV breakdown.",
  engagement: "Audience engagement and content performance.",
};

interface DashboardClientProps {
  type: DashboardType;
  metrics: DashboardMetric[];
  history: DashboardMetric[];
  periods: string[];
  selectedPeriod: string | undefined;
}

export function DashboardClient({
  type,
  metrics,
  history,
  periods,
  selectedPeriod,
}: DashboardClientProps) {
  const router = useRouter();

  const handleTypeChange = (newType: DashboardType) => {
    const url = selectedPeriod
      ? `${dashboardPath(newType)}?period=${selectedPeriod}`
      : dashboardPath(newType);
    router.push(url);
  };

  const handlePeriodChange = (period: string) => {
    const url = period ? `${dashboardPath(type)}?period=${period}` : dashboardPath(type);
    router.push(url);
  };

  return (
    <DashboardShell
      title={TYPE_LABELS[type]}
      description={TYPE_DESCRIPTIONS[type]}
      types={DASHBOARD_TYPES}
      activeType={type}
      onTypeChange={handleTypeChange}
      typeLabels={TYPE_LABELS}
      periods={periods}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
    >
      <div className="flex flex-col gap-6">
        <KpiCards metrics={metrics} />
        <ChartSection history={history} />
        <DataTableSection metrics={metrics} />
      </div>
    </DashboardShell>
  );
}
