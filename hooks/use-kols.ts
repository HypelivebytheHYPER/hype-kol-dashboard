"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { larkApi, parseLarkKOL } from "@/lib/lark-api";
import type { KOL, KOLFilter } from "@/lib/types";

// Query keys
export const kolKeys = {
  all: ["kols"] as const,
  lists: () => [...kolKeys.all, "list"] as const,
  list: (filters: KOLFilter) => [...kolKeys.lists(), filters] as const,
  details: () => [...kolKeys.all, "detail"] as const,
  detail: (id: string) => [...kolKeys.details(), id] as const,
  live: () => [...kolKeys.all, "live"] as const,
};

// Hook to fetch all KOLs with filters
export function useKOLs(filters?: KOLFilter) {
  return useQuery({
    queryKey: kolKeys.list(filters || {}),
    queryFn: async () => {
      // For now, return mock data
      // In production: const records = await larkApi.getKOLs(filters);
      // return records.map(parseLarkKOL);
      return [] as KOL[];
    },
  });
}

// Hook to fetch a single KOL
export function useKOL(id: string) {
  return useQuery({
    queryKey: kolKeys.detail(id),
    queryFn: async () => {
      // For now, return null
      // In production: const record = await larkApi.getKOL(id);
      // return record ? parseLarkKOL(record) : null;
      return null as KOL | null;
    },
    enabled: !!id,
  });
}

// Hook to fetch live KOLs
export function useLiveKOLs() {
  return useQuery({
    queryKey: kolKeys.live(),
    queryFn: async () => {
      // For now, return mock data
      // In production: const records = await larkApi.getLiveKOLs();
      // return records.map(parseLarkKOL);
      return [] as KOL[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
}

// Hook to search KOLs
export function useSearchKOLs(query: string) {
  return useQuery({
    queryKey: [...kolKeys.all, "search", query],
    queryFn: async () => {
      if (!query) return [];
      // For now, return mock data
      // In production: const records = await larkApi.getKOLs({ search: query });
      // return records.map(parseLarkKOL);
      return [] as KOL[];
    },
    enabled: query.length > 0,
  });
}
