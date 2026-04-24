"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, Command } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/contexts/i18n-context";
import { ThemeToggle } from "./theme-toggle";
import { NotificationButton } from "./notification-button";

const CommandPalette = dynamic(
  () =>
    import("@/components/search/command-palette").then((m) => m.CommandPalette),
  { ssr: false }
);

export function Header() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const { t } = useI18n();

  const openPalette = () => {
    setPaletteMounted(true);
    setCommandOpen(true);
  };

  return (
    <>
      <header className="hidden lg:flex h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="outline"
            className="w-full max-w-sm justify-between text-muted-foreground border-border/30 hover:border-border/60 hover:bg-muted/30 transition-all duration-200"
            onClick={openPalette}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="shrink-0 size-4" />
              <span className="text-sm truncate">{t("header.searchPlaceholder")}</span>
            </div>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/40 bg-muted/30 px-1.5 font-mono text-[10px] font-medium shrink-0">
              <Command className="size-3" />K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle title={t("header.toggleTheme")} />
          <LanguageSwitcher />
          <NotificationButton className="relative" />
          <div className="flex items-center gap-3 pl-3 border-l border-border/30">
            <Avatar className="size-10">
              <AvatarFallback className="bg-muted text-sm font-semibold">H</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {paletteMounted && (
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      )}
    </>
  );
}
