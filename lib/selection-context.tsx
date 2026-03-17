"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ApiKOL } from "@/lib/lark-api";

interface SelectionItem {
  kol: ApiKOL;
  notes?: string;
  adjustedRate?: number;
}

interface SelectionContextType {
  items: SelectionItem[];
  selectedIds: Set<string>;
  toggle: (kol: ApiKOL) => void;
  isSelected: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  targetCampaignId: string | null;
  setTargetCampaignId: (id: string | null) => void;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [targetCampaignId, setTargetCampaignId] = useState<string | null>(null);

  const selectedIds = new Set(items.map((i) => i.kol.id));
  const count = items.length;

  const toggle = useCallback((kol: ApiKOL) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.kol.id === kol.id);
      if (exists) {
        return prev.filter((i) => i.kol.id !== kol.id);
      }
      return [...prev, { kol }];
    });
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.kol.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        items,
        selectedIds,
        toggle,
        isSelected,
        remove,
        clear,
        count,
        isOpen,
        setIsOpen,
        targetCampaignId,
        setTargetCampaignId,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within SelectionProvider");
  }
  return context;
}
