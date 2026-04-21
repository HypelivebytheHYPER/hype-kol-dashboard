"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";
import { localeLabels, localeFlags, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-md hover:bg-accent hover:text-accent-foreground"
            title={t("header.language")}
          >
            <Globe />
            <span className="sr-only">{t("header.language")}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {(Object.keys(localeLabels) as Locale[]).map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              "gap-2 cursor-pointer",
              locale === loc && "bg-accent"
            )}
          >
            <span className="text-base">{localeFlags[loc]}</span>
            <span className="flex-1">{localeLabels[loc]}</span>
            {locale === loc && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
