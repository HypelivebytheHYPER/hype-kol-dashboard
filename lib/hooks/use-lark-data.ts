"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchRecords, resolveFileUrl, TABLES, type TableId } from "@/lib/lark-base";
import { recordToCreator, recordToLiveMC, recordToTechKOL } from "@/lib/cached-data";
import { queryClient } from "@/lib/query-client";

// Query keys for cache management
export const larkKeys = {
  all: ["lark"] as const,
  tables: () => [...larkKeys.all, "tables"] as const,
  table: (tableId: TableId) => [...larkKeys.tables(), tableId] as const,
  records: (tableId: TableId, filters?: unknown) => 
    [...larkKeys.table(tableId), "records", filters] as const,
  fileUrl: (token: string) => [...larkKeys.all, "file", token] as const,
};

// Hook for fetching KOLs
export function useKOLs() {
  return useQuery({
    queryKey: larkKeys.records(TABLES.ALL_KOLS),
    queryFn: async () => {
      const result = await fetchRecords(TABLES.ALL_KOLS, { tags: ["kols"] });
      return result.data.map(recordToCreator);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching Live MCs
export function useLiveMCs() {
  return useQuery({
    queryKey: larkKeys.records(TABLES.LIVE_MC_LIST),
    queryFn: async () => {
      const result = await fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"] });
      return result.data.map(recordToLiveMC);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for fetching Tech KOLs
export function useTechKOLs() {
  return useQuery({
    queryKey: larkKeys.records(TABLES.KOL_TECH),
    queryFn: async () => {
      const result = await fetchRecords(TABLES.KOL_TECH, { tags: ["tech"] });
      return result.data.map(recordToTechKOL);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook for resolving file URLs with caching
export function useFileUrl(token: string) {
  return useQuery({
    queryKey: larkKeys.fileUrl(token),
    queryFn: () => resolveFileUrl(token),
    staleTime: 1000 * 60 * 60 * 23, // 23 hours (Lark URLs valid for 24h)
    enabled: !!token,
  });
}

// Hook for resolving multiple file URLs in parallel
export function useFileUrls(tokens: string[]) {
  return useQueries({
    queries: tokens.map((token) => ({
      queryKey: larkKeys.fileUrl(token),
      queryFn: () => resolveFileUrl(token),
      staleTime: 1000 * 60 * 60 * 23,
      enabled: !!token,
    })),
    combine: (results) => {
      const urlMap: Record<string, string> = {};
      results.forEach((result, index) => {
        if (result.data) {
          urlMap[tokens[index]] = result.data;
        }
      });
      return {
        data: urlMap,
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
      };
    },
  });
}

// Hook for prefetching data (useful for hover states)
export function usePrefetchLarkData() {
  const prefetchKOLs = () => {
    queryClient.prefetchQuery({
      queryKey: larkKeys.records(TABLES.ALL_KOLS),
      queryFn: async () => {
        const result = await fetchRecords(TABLES.ALL_KOLS);
        return result.data.map(recordToCreator);
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return { prefetchKOLs };
}
