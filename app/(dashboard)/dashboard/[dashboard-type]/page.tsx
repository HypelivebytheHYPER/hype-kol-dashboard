import { notFound } from "next/navigation";
import { DASHBOARD_TYPES, type DashboardType } from "@/lib/constants";
import {
  loadDashboardMetrics,
  loadDashboardMetricsHistory,
  loadDashboardPeriods,
} from "@/lib/record-mappers";
import { DashboardClient } from "./dashboard-client";

interface DashboardPageProps {
  params: Promise<{ "dashboard-type": string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function DashboardPage({
  params,
  searchParams,
}: DashboardPageProps) {
  const { "dashboard-type": type } = await params;
  const { period } = await searchParams;

  if (!DASHBOARD_TYPES.includes(type as DashboardType)) {
    notFound();
  }

  const [metrics, history, periods] = await Promise.all([
    loadDashboardMetrics(type as DashboardType, period),
    loadDashboardMetricsHistory(type as DashboardType),
    loadDashboardPeriods(),
  ]);

  return (
    <DashboardClient
      type={type as DashboardType}
      metrics={metrics}
      history={history}
      periods={periods}
      selectedPeriod={period}
    />
  );
}
