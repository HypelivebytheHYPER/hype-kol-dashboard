"use client";

import { useCallback } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from "next-themes";

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
} as const;

export function ThemeProvider({ children, ...props }: Partial<ThemeProviderProps>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEMES.DARK}
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/** Toggle between dark and light. Falls back to dark if theme is undefined. */
export function useToggleTheme() {
  const { theme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    const next = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(next);
  }, [theme, setTheme]);

  return { theme, toggle };
}
