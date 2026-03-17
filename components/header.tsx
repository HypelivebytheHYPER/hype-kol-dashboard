"use client";

import { useState } from "react";
import { Search, Bell, Command, Sun, Moon } from "lucide-react";
import { UserAvatar } from "@/components/ui/premium-avatar";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/search/command-palette";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n-context";

export function Header() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, locale } = useI18n();

  return (
    <>
      <header className="hidden lg:flex h-16 border-b border-border bg-card/50 backdrop-blur-sm items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="outline"
            className="w-full max-w-sm justify-between text-muted-foreground"
            onClick={() => setCommandOpen(true)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">{t("header.searchPlaceholder")}</span>
            </div>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium shrink-0">
              <Command className="w-3 h-3" />K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Dark / Light toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={t("header.toggleTheme")}
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title={t("header.notifications")}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">hype@agency.com</p>
            </div>
            <UserAvatar name="Admin User" size="md" />
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
