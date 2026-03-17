/**
 * Discovery Store - Zustand
 * Manages liked, passed, and super-liked KOLs
 * Persists to localStorage for session continuity
 * Now integrated with Campaign system
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KOLCardData } from "../types/kol";

interface DiscoveryState {
  // Collections
  likedKOLs: KOLCardData[];
  passedKOLIds: string[];
  superLikedKOLs: KOLCardData[];

  // Campaign Integration
  autoAddToCampaign: boolean;
  setAutoAddToCampaign: (enabled: boolean) => void;

  // Actions
  addToLiked: (kol: KOLCardData) => void;
  addToPassed: (kol: KOLCardData) => void;
  addToSuperLiked: (kol: KOLCardData) => void;

  removeFromLiked: (kolId: string) => void;
  removeFromSuperLiked: (kolId: string) => void;
  removePassed: (kolId: string) => void;

  // Utilities
  isLiked: (kolId: string) => boolean;
  isPassed: (kolId: string) => boolean;
  isSuperLiked: (kolId: string) => boolean;

  // Statistics
  getStats: () => {
    totalLiked: number;
    totalPassed: number;
    totalSuperLiked: number;
    totalSwiped: number;
  };

  // Campaign-aware stats
  getCampaignAwareStats: (campaignKOLCount: number) => {
    totalLiked: number;
    totalPassed: number;
    totalSuperLiked: number;
    totalSwiped: number;
    inCampaign: number;
  };

  clearAll: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      likedKOLs: [],
      passedKOLIds: [],
      superLikedKOLs: [],

      // Add to liked
      addToLiked: (kol) =>
        set((state) => {
          // Avoid duplicates
          if (state.likedKOLs.some((k) => k.id === kol.id)) {
            return state;
          }
          return {
            likedKOLs: [...state.likedKOLs, kol],
          };
        }),

      // Add to passed
      addToPassed: (kol) =>
        set((state) => {
          if (state.passedKOLIds.includes(kol.id)) {
            return state;
          }
          return {
            passedKOLIds: [...state.passedKOLIds, kol.id],
          };
        }),

      // Add to super-liked
      addToSuperLiked: (kol) =>
        set((state) => {
          if (state.superLikedKOLs.some((k) => k.id === kol.id)) {
            return state;
          }
          return {
            superLikedKOLs: [...state.superLikedKOLs, kol],
          };
        }),

      // Remove from liked
      removeFromLiked: (kolId) =>
        set((state) => ({
          likedKOLs: state.likedKOLs.filter((k) => k.id !== kolId),
        })),

      // Remove from super-liked
      removeFromSuperLiked: (kolId) =>
        set((state) => ({
          superLikedKOLs: state.superLikedKOLs.filter((k) => k.id !== kolId),
        })),

      // Remove from passed
      removePassed: (kolId) =>
        set((state) => ({
          passedKOLIds: state.passedKOLIds.filter((id) => id !== kolId),
        })),

      // Check if liked
      isLiked: (kolId) => {
        const state = get();
        return state.likedKOLs.some((k) => k.id === kolId);
      },

      // Check if passed
      isPassed: (kolId) => {
        const state = get();
        return state.passedKOLIds.includes(kolId);
      },

      // Check if super-liked
      isSuperLiked: (kolId) => {
        const state = get();
        return state.superLikedKOLs.some((k) => k.id === kolId);
      },

      // Campaign integration settings
      autoAddToCampaign: true,
      setAutoAddToCampaign: (enabled) => set({ autoAddToCampaign: enabled }),

      // Get statistics
      getStats: () => {
        const state = get();
        return {
          totalLiked: state.likedKOLs.length,
          totalPassed: state.passedKOLIds.length,
          totalSuperLiked: state.superLikedKOLs.length,
          totalSwiped:
            state.likedKOLs.length + state.passedKOLIds.length + state.superLikedKOLs.length,
        };
      },

      // Get campaign-aware statistics
      getCampaignAwareStats: (campaignKOLCount: number) => {
        const state = get();
        return {
          totalLiked: state.likedKOLs.length,
          totalPassed: state.passedKOLIds.length,
          totalSuperLiked: state.superLikedKOLs.length,
          totalSwiped:
            state.likedKOLs.length + state.passedKOLIds.length + state.superLikedKOLs.length,
          inCampaign: campaignKOLCount,
        };
      },

      // Clear all
      clearAll: () =>
        set({
          likedKOLs: [],
          passedKOLIds: [],
          superLikedKOLs: [],
        }),
    }),
    {
      name: "kol-discovery-store",
      partialize: (state) => ({
        likedKOLs: state.likedKOLs,
        passedKOLIds: state.passedKOLIds,
        superLikedKOLs: state.superLikedKOLs,
        autoAddToCampaign: state.autoAddToCampaign,
      }),
    }
  )
);
