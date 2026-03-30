import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KOLCardData } from "../types/kol";

interface DiscoveryState {
  likedKOLs: KOLCardData[];
  passedKOLIds: string[];
  superLikedKOLs: KOLCardData[];

  addToLiked: (kol: KOLCardData) => void;
  addToPassed: (kol: KOLCardData) => void;
  addToSuperLiked: (kol: KOLCardData) => void;
  removeFromLiked: (kolId: string) => void;
  removeFromSuperLiked: (kolId: string) => void;
  removePassed: (kolId: string) => void;

  isLiked: (kolId: string) => boolean;
  isPassed: (kolId: string) => boolean;
  isSuperLiked: (kolId: string) => boolean;

  clearAll: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      likedKOLs: [],
      passedKOLIds: [],
      superLikedKOLs: [],

      addToLiked: (kol) =>
        set((state) => {
          if (state.likedKOLs.some((k) => k.id === kol.id)) return state;
          return { likedKOLs: [...state.likedKOLs, kol] };
        }),

      addToPassed: (kol) =>
        set((state) => {
          if (state.passedKOLIds.includes(kol.id)) return state;
          return { passedKOLIds: [...state.passedKOLIds, kol.id] };
        }),

      addToSuperLiked: (kol) =>
        set((state) => {
          if (state.superLikedKOLs.some((k) => k.id === kol.id)) return state;
          return { superLikedKOLs: [...state.superLikedKOLs, kol] };
        }),

      removeFromLiked: (kolId) =>
        set((state) => ({ likedKOLs: state.likedKOLs.filter((k) => k.id !== kolId) })),

      removeFromSuperLiked: (kolId) =>
        set((state) => ({ superLikedKOLs: state.superLikedKOLs.filter((k) => k.id !== kolId) })),

      removePassed: (kolId) =>
        set((state) => ({ passedKOLIds: state.passedKOLIds.filter((id) => id !== kolId) })),

      isLiked: (kolId) => get().likedKOLs.some((k) => k.id === kolId),
      isPassed: (kolId) => get().passedKOLIds.includes(kolId),
      isSuperLiked: (kolId) => get().superLikedKOLs.some((k) => k.id === kolId),

      clearAll: () => set({ likedKOLs: [], passedKOLIds: [], superLikedKOLs: [] }),
    }),
    {
      name: "kol-discovery-store",
      partialize: (state) => ({
        likedKOLs: state.likedKOLs,
        passedKOLIds: state.passedKOLIds,
        superLikedKOLs: state.superLikedKOLs,
      }),
    }
  )
);
