"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { larkApi } from "@/lib/lark-api";

export const campaignKeys = {
  all: ["campaigns"] as const,
  list: () => [...campaignKeys.all, "list"] as const,
  detail: (id: string) => [...campaignKeys.all, "detail", id] as const,
};

// Standard retry config for rate limiting
const retryConfig = {
  retry: (failureCount: number, error: Error) => {
    if (error.message.includes("404")) return false;
    if (error.message.includes("501")) return false;
    if (error.message.includes("503")) return false;
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
};

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.list(),
    queryFn: () => larkApi.getCampaigns(),
    staleTime: 60_000, // 1 minute fresh
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: false,
    ...retryConfig,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => larkApi.getCampaign(id),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...retryConfig,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => larkApi.createCampaign(body),
    onSuccess: (data) => {
      // Immediately inject into list cache so UI doesn't wait for CDN-cached GET
      if (data?.data) {
        qc.setQueryData(
          campaignKeys.list(),
          (old: { data: unknown[]; total: number } | undefined) => {
            if (!old?.data) return old;
            return { ...old, data: [...old.data, data.data], total: (old.total ?? 0) + 1 };
          }
        );
      }
      qc.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      larkApi.updateCampaign(id, body),
    onSuccess: (data, variables) => {
      // Immediately update both detail and list caches — bypasses CDN stale reads
      if (data?.data) {
        qc.setQueryData(campaignKeys.detail(variables.id), { data: data.data });
        qc.setQueryData(
          campaignKeys.list(),
          (old: { data: Record<string, unknown>[]; total: number } | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((c) => (c.id === variables.id ? { ...c, ...data.data } : c)),
            };
          }
        );
      }
      qc.invalidateQueries({ queryKey: campaignKeys.all });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/lark/api/campaigns/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete campaign");
      }),
    onSuccess: (_, id) => {
      // Remove from list cache immediately
      qc.setQueryData(
        campaignKeys.list(),
        (old: { data: Record<string, unknown>[]; total: number } | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((c) => c.id !== id),
            total: Math.max(0, (old.total ?? 0) - 1),
          };
        }
      );
      qc.removeQueries({ queryKey: campaignKeys.detail(id) });
      qc.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}
