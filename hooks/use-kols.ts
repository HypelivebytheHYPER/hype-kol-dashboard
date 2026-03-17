"use client";

import { useQuery } from "@tanstack/react-query";
import { larkApi } from "@/lib/lark-api";

// Standard retry config for rate limiting
const retryConfig = {
  retry: (failureCount: number, error: Error) => {
    if (error.message.includes("404")) return false;
    if (error.message.includes("501")) return false; // Not Implemented — don't retry
    if (error.message.includes("503")) return false; // Unavailable — don't retry
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
};

// Cache configuration - 5 minutes stale, 10 minutes garbage collection
const cacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
};

export const kolKeys = {
  all: ["kols"] as const,
  list: () => [...kolKeys.all, "list"] as const,
  detail: (id: string) => [...kolKeys.all, "detail", id] as const,
  live: () => [...kolKeys.all, "live"] as const,
  niche: (type?: string) => [...kolKeys.all, "niche", type] as const,
  doctor: () => [...kolKeys.all, "doctor"] as const,
  beauty: () => [...kolKeys.all, "beauty"] as const,
  tech: () => [...kolKeys.all, "tech"] as const,
  search: (q: string) => [...kolKeys.all, "search", q] as const,
  quickSearch: (q: string) => [...kolKeys.all, "quick", q] as const,
};

export function useKOLs() {
  return useQuery({
    queryKey: kolKeys.list(),
    queryFn: () => larkApi.getKOLs(),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useKOL(id: string) {
  return useQuery({
    queryKey: kolKeys.detail(id),
    queryFn: () => larkApi.getKOL(id),
    enabled: !!id,
    ...retryConfig,
  });
}

export function useKOLRelated(id: string) {
  return useQuery({
    queryKey: [...kolKeys.detail(id), "related"] as const,
    queryFn: () => larkApi.getKOLRelated(id),
    enabled: !!id,
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useLiveKOLs() {
  return useQuery({
    queryKey: kolKeys.live(),
    queryFn: () => larkApi.getLiveKOLs(),
    refetchInterval: 30_000,
    ...retryConfig,
  });
}

export function useDoctorKOLs() {
  return useQuery({
    queryKey: kolKeys.doctor(),
    queryFn: () => larkApi.getDoctorKOLs(),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useBeautyKOLs() {
  return useQuery({
    queryKey: kolKeys.beauty(),
    queryFn: () => larkApi.getBeautyKOLs(),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useTechKOLs() {
  return useQuery({
    queryKey: kolKeys.tech(),
    queryFn: () => larkApi.getTechKOLs(),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useNicheKOLs(niche?: string) {
  return useQuery({
    queryKey: kolKeys.niche(niche),
    queryFn: () => larkApi.getNicheKOLs(niche),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useLiveSellers() {
  return useQuery({
    queryKey: [...kolKeys.all, "liveSellers"] as const,
    queryFn: () => larkApi.getLiveSellers(),
    ...cacheConfig,
    ...retryConfig,
  });
}

export function useQuickSearch(q: string) {
  return useQuery({
    queryKey: kolKeys.quickSearch(q),
    queryFn: () => larkApi.quickSearch(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
    ...retryConfig,
  });
}

export function useSearchKOLs(params: Parameters<typeof larkApi.search>[0]) {
  return useQuery({
    queryKey: [...kolKeys.all, "advancedSearch", params],
    queryFn: () => larkApi.search(params),
    enabled: !!(params.q || params.tier || params.category || params.platform),
    staleTime: 30_000,
    ...retryConfig,
  });
}

// OOH Media Keys
export const oohKeys = {
  all: ["ooh"] as const,
  list: (filters?: { category?: string; vendor?: string; location?: string; search?: string }) =>
    [...oohKeys.all, "list", filters] as const,
};

export function useOOHMedia(filters?: {
  category?: string;
  vendor?: string;
  location?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: oohKeys.list(filters),
    queryFn: () => larkApi.getOOHMedia(filters),
    ...cacheConfig,
    ...retryConfig,
  });
}
