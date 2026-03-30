"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
// Force cache-bust: v3
// Hardcoded default messages to ensure they're bundled
const defaultMessages = {
  common: {
    loading: "Loading...",
    loadMore: "Load more",
    noResults: "No results found",
    tryAdjusting: "Try adjusting your filters",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    view: "View",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    showing: "Showing",
    of: "of",
    results: "results",
    perPage: "per page",
    live: "LIVE",
    viewAll: "View All",
    seeAll: "See All",
    discoverMore: "Discover More",
    more: "More",
  },
  hero: {
    badgePlatform: "HypeCreators Discovery Platform",
    liveNow: "Live Now",
    title: "Creators",
    description:
      "Browse {{count}}+ verified influencers, live sellers, and content creators. Filter by tier, category, performance metrics, and more.",
    searchPlaceholder: "Search KOLs...",
    recentSearches: "Recent",
  },
  categories: {
    browseBy: "Browse by Category",
  },
  sections: {
    topPerformers: "Top Performers",
    byGmv: "By GMV",
    liveCommerceStars: "Live Commerce Stars",
    liveCommerceDescription: "Top-performing live sellers with proven GMV",
    viewLiveCenter: "View Live Center",
    risingStars: "Rising Stars",
    highEngagement: "High Engagement",
  },
  stats: {
    totalKols: "Total KOLs",
    liveSellers: "Live Sellers",
    avgGmv: "Avg GMV",
    categories: "Categories",
  },
  header: {
    searchPlaceholder: "Search anything...",
    notifications: "Notifications",
    toggleTheme: "Switch look",
    language: "Language",
  },
  nav: {
    dashboard: "Dashboard",
    discovery: "Find KOLs",
    techCreators: "Tech Creators",
    live: "Live Center",
    pricing: "Pricing",
    settings: "Settings",
  },
};

// Simple translations loader
async function loadTranslations(locale: Locale) {
  const messages = await import(`@/locales/${locale}.json`).then((m) => m.default);
  return messages;
}

type Translations = Record<string, unknown>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialMessages,
}: {
  children: ReactNode;
  initialMessages?: Translations;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check localStorage for saved preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locale") as Locale;
      if (saved && locales.includes(saved)) return saved;
    }
    return defaultLocale;
  });

  const [messages, setMessages] = useState<Translations>(initialMessages || defaultMessages);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("[i18n] Initial messages count:", Object.keys(initialMessages || {}).length);
    console.log("[i18n] Default messages count:", Object.keys(defaultMessages || {}).length);
    console.log("[i18n] Current messages count:", Object.keys(messages || {}).length);
    console.log("[i18n] Has common.viewAll:", !!(messages as any)?.common?.viewAll);
  }, []);

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      if (newLocale === locale) return;

      setIsLoading(true);
      try {
        const newMessages = await loadTranslations(newLocale);
        setMessages(newMessages);
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
        document.documentElement.lang = newLocale;
      } finally {
        setIsLoading(false);
      }
    },
    [locale]
  );

  // Load initial translations on mount
  useEffect(() => {
    if (Object.keys(messages).length === 0) {
      loadTranslations(locale).then(setMessages);
    }
  }, []);

  // Translation function with dot notation support and parameter interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = key.split(".").reduce<unknown>((obj, k) => {
        if (obj && typeof obj === "object" && k in obj) {
          return (obj as Record<string, unknown>)[k];
        }
        return undefined;
      }, messages);

      let result = typeof value === "string" ? value : key;

      // Replace parameters like {{param}}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), String(paramValue));
        });
      }

      return result;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
