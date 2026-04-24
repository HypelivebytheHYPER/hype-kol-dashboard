"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { BrandLogo } from "./brand-logo";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { NotificationButton } from "./notification-button";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="h-14 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger aria-label="Open navigation menu" className="size-10 inline-flex items-center justify-center rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Menu className="size-5 text-foreground" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border">
            <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="p-5">
                <BrandLogo onClick={() => setOpen(false)} />
              </div>
              <NavLinks
                onNavigate={() => setOpen(false)}
                linkClassName="py-3.5"
              />
            </div>
          </SheetContent>
        </Sheet>

        <BrandLogo size="sm" />
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationButton className="relative" />
      </div>
    </header>
  );
}
