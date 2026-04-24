"use client";

import { type DashboardType } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { CalendarDays } from "lucide-react";

interface DashboardShellProps {
  title: string;
  description: string;
  types: readonly DashboardType[];
  activeType: DashboardType;
  onTypeChange: (type: DashboardType) => void;
  typeLabels: Record<DashboardType, string>;
  periods: string[];
  selectedPeriod: string | undefined;
  onPeriodChange: (period: string) => void;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  description,
  types,
  activeType,
  onTypeChange,
  typeLabels,
  periods,
  selectedPeriod,
  onPeriodChange,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Type Tabs */}
        <Tabs value={activeType} onValueChange={(v) => onTypeChange(v as DashboardType)}>
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            {types.map((t) => (
              <TabsTrigger key={t} value={t} className="text-sm">
                {typeLabels[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Period Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarDays className="size-3.5" />
                <span>{selectedPeriod ?? "All Periods"}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuRadioGroup
              value={selectedPeriod ?? ""}
              onValueChange={(v) => onPeriodChange(v)}
            >
              <DropdownMenuRadioItem value="">All Periods</DropdownMenuRadioItem>
              {periods.map((p) => (
                <DropdownMenuRadioItem key={p} value={p}>
                  {p}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up">{children}</div>
    </div>
  );
}
