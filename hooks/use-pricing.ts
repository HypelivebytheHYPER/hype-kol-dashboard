"use client";

import { useQuery } from "@tanstack/react-query";
import { larkApi } from "@/lib/lark-api";

export const pricingKeys = {
  all: ["pricing"] as const,
  rateCards: (kolId?: string) => [...pricingKeys.all, "rateCards", kolId] as const,
  tierRates: () => [...pricingKeys.all, "tierRates"] as const,
  competitorRates: () => [...pricingKeys.all, "competitors"] as const,
  benchmarks: (tier?: string, platform?: string) =>
    [...pricingKeys.all, "benchmarks", tier, platform] as const,
};

export function useRateCards(kolId?: string) {
  return useQuery({
    queryKey: pricingKeys.rateCards(kolId),
    queryFn: () => larkApi.getRateCards(kolId),
    staleTime: 120_000,
  });
}

export function useTierRates() {
  return useQuery({
    queryKey: pricingKeys.tierRates(),
    queryFn: () => larkApi.getTierRates(),
    staleTime: 300_000,
  });
}

export function useCompetitorRates() {
  return useQuery({
    queryKey: pricingKeys.competitorRates(),
    queryFn: () => larkApi.getCompetitorRates(),
    staleTime: 300_000,
  });
}

export function useMarketBenchmarks(tier?: string, platform?: string) {
  return useQuery({
    queryKey: pricingKeys.benchmarks(tier, platform),
    queryFn: () => larkApi.getMarketBenchmarks(tier, platform),
    staleTime: 300_000,
  });
}
