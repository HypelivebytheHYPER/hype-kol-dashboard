"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Command, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

// Quick-search chips shown in the mobile overlay.
// These are high-intent shortcuts, not an exhaustive taxonomy.
const QUICK_TAGS = ["Beauty", "Tech", "Live Sellers", "Mega", "Micro"];

const POPULAR_SEARCHES = [
  { label: "Top Live Sellers", href: "/kols?tier=live" },
  { label: "Beauty Creators", href: "/kols?category=beauty" },
  { label: "High GMV", href: "/kols?sort=gmv" },
];

/**
 * Lazy-loadable search overlay.
 * Keeps the overlay chunk out of the initial bundle for /kols and /live.
 */
export function MobileSearchOverlay({
  open,
  onClose,
  searchQuery,
  onSearchQueryChange,
}: MobileSearchOverlayProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kols?search=${encodeURIComponent(searchQuery)}`);
      onClose();
      onSearchQueryChange("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200">
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </form>
          <button
            onClick={onClose}
            className="size-10 inline-flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col p-4 gap-4">
          <p className="text-sm font-medium text-muted-foreground">{t("search.quick")}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  router.push(`/kols?category=${encodeURIComponent(tag)}`);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">{t("search.popular")}</p>
          <div className="flex flex-col gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Command className="size-4 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
