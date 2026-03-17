"use client";

import { X, ShoppingBag, Eye, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/lib/selection-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n-context";
import type { ApiKOL } from "@/lib/lark-api";
import { AddToCampaignDialog } from "./add-to-campaign-dialog-dynamic";

export function FloatingSelectionBar() {
  const { count, items, clear, isOpen, setIsOpen, remove, targetCampaignId } = useSelection();
  const { t } = useI18n();

  if (count === 0) return null;

  const totalEstimatedRate = items.reduce((sum, item) => {
    const baseRate =
      item.kol.tier === "Nano KOL"
        ? 5000
        : item.kol.tier === "Micro KOL"
          ? 25000
          : item.kol.tier === "Mid-tier"
            ? 80000
            : item.kol.tier === "Macro KOL"
              ? 250000
              : item.kol.tier === "Mega KOL"
                ? 800000
                : 0;
    return sum + baseRate;
  }, 0);

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-card border shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {count}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                {count === 1 ? "1 KOL selected" : `${count} KOLs selected`}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("kol.selection.estimatedTotal")}: {formatCurrency(totalEstimatedRate)}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{t("kol.actions.review")}</span>
          </Button>

          <AddToCampaignDialog preselectedCampaignId={targetCampaignId ?? undefined}>
            <Button size="sm" className="gap-2 rounded-full">
              <ShoppingBag className="w-4 h-4" />
              {t("kol.selection.addToCampaign")}
            </Button>
          </AddToCampaignDialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={clear}
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Review Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {t("kol.selection.title")}
              <Badge variant="secondary">{count}</Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {items.map(({ kol }) => (
              <div key={kol.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{kol.name}</p>
                  <p className="text-sm text-muted-foreground">@{kol.handle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      {kol.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(kol.followers)} {t("kol.metrics.followers.label")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => remove(kol.id)}
                  aria-label={`Remove ${kol.name}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("kol.selection.estimatedTotal")}</span>
              <span className="font-medium">{formatCurrency(totalEstimatedRate)}</span>
            </div>

            <AddToCampaignDialog preselectedCampaignId={targetCampaignId ?? undefined}>
              <Button className="w-full gap-2">
                <ShoppingBag className="w-4 h-4" />
                {t("kol.selection.addToCampaign")}
              </Button>
            </AddToCampaignDialog>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <FileText className="w-4 h-4" />
                {t("kol.actions.exportPDF")}
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                {t("kol.actions.share")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SelectionCheckbox({ kol }: { kol: ApiKOL }) {
  const { isSelected, toggle } = useSelection();
  const selected = isSelected(kol.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(kol);
      }}
      className={`
        flex items-center justify-center w-7 h-7 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${
          selected
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-background border-border hover:border-primary/50"
        }
      `}
      aria-label={selected ? `Deselect ${kol.name}` : `Select ${kol.name}`}
      aria-pressed={selected}
      role="checkbox"
    >
      {selected && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
