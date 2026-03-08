"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { larkApi } from "@/lib/lark-api";
import type { Campaign, CampaignCreateInput } from "@/lib/types";

// Query keys
export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (filters?: string) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

// Hook to fetch all campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: async () => {
      // For now, return mock data
      // In production: return await larkApi.getCampaigns();
      return [] as Campaign[];
    },
  });
}

// Hook to fetch a single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async () => {
      // For now, return null
      // In production: return await larkApi.getCampaign(id);
      return null as Campaign | null;
    },
    enabled: !!id,
  });
}

// Hook to create a campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CampaignCreateInput) => {
      // In production: return await larkApi.createCampaign(input);
      return {} as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Hook to update a campaign
export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      // In production: return await larkApi.updateCampaign(id, data);
      return {} as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
