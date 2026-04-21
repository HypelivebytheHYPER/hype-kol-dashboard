"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { defaultLocale, type Locale } from "@/i18n/config";

type Translations = Record<string, unknown>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Minimal English fallback — no external JSON files on production.
// When the remote translation API is wired up, loadTranslations() will
// return locale-specific messages that override these defaults.
const FALLBACK_MESSAGES: Translations = {
  header: {
    language: "Switch language",
    notifications: "Notifications",
    searchPlaceholder: "Search anything...",
    toggleTheme: "Switch look",
  },
  hero: {
    searchPlaceholder: "Search creators...",
  },
  search: {
    quick: "Quick Search",
    popular: "Popular",
  },
  nav: {
    menu: "Navigation Menu",
  },
  kol: {
    actions: {
      view: "View",
      viewProfile: "View Profile",
    },
    metrics: {
      followers: {
        label: "Followers",
        tooltip: "Total subscribers on their main platform",
      },
      engagement: {
        label: "Engagement",
        tooltip: "How much their audience interacts. Industry average is 1-3%",
        tooltipHigh: "Amazing engagement — their audience really connects!",
      },
      gmv: {
        label: "Avg GMV",
        tooltip: "Average sales they generate per month",
      },
      revenue: {
        label: "Revenue",
        tooltip: "Total revenue generated",
      },
      views: {
        label: "Views",
        tooltip: "Total views across all their content",
      },
      qualityScore: {
        label: "Quality Score",
        tooltip: "Our rating from 0-5 based on content quality, consistency, and professionalism",
        excellent: "Excellent — top tier creator",
        good: "Good — solid and reliable",
        average: "Decent — room to grow",
        belowAverage: "Below average — risky choice",
      },
      contentOutput: {
        live: "Live",
        video: "Video",
        videos: "Videos",
        tooltip: "Content they've created — {{liveNum}} live streams, {{videoNum}} videos",
      },
    },
  },
};

// Load translations from remote API. No local JSON bundles on production.
async function loadTranslations(locale: Locale): Promise<Translations> {
  // TODO: wire to `/api/translations?locale=${locale}` or Lark Base table
  void locale;
  return {};
}

export function I18nProvider({
  children,
  initialMessages = FALLBACK_MESSAGES,
}: {
  children: ReactNode;
  initialMessages?: Translations;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Translations>(initialMessages);

  const setLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      const nextMessages = await loadTranslations(next);
      setMessages({ ...FALLBACK_MESSAGES, ...nextMessages });
      setLocaleState(next);
      document.documentElement.lang = next;
    },
    [locale, setMessages, setLocaleState]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = key.split(".").reduce<unknown>((obj, k) => {
        if (obj && typeof obj === "object" && k in obj) {
          return (obj as Record<string, unknown>)[k];
        }
        return undefined;
      }, messages);
      let result = typeof value === "string" ? value : key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
        }
      }
      return result;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
