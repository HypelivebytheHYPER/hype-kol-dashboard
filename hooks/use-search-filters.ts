"use client";

import { useState, useCallback } from "react";
import type { KOLFilter, SearchCriteria } from "@/lib/types";

export function useSearchFilters() {
  const [filters, setFilters] = useState<KOLFilter>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilter = useCallback((key: keyof KOLFilter, value: string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  }, []);

  const setFilter = useCallback(<K extends keyof KOLFilter>(
    key: K,
    value: KOLFilter[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
  }, []);

  const activeFilterCount = Object.values(filters).flat().length;

  return {
    filters,
    searchQuery,
    setSearchQuery,
    toggleFilter,
    setFilter,
    clearFilters,
    activeFilterCount,
  };
}

export function useSearchCriteria() {
  const [criteria, setCriteria] = useState<SearchCriteria>({});

  const setCriterion = useCallback(<K extends keyof SearchCriteria>(
    key: K,
    value: SearchCriteria[K]
  ) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearCriteria = useCallback(() => {
    setCriteria({});
  }, []);

  return {
    criteria,
    setCriterion,
    clearCriteria,
  };
}
