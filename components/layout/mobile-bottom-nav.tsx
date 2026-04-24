"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { MOBILE_BOTTOM_NAV as navItems } from "@/lib/nav-items";

// Lazy-load the search overlay.
// Only ships the overlay chunk once the user first taps search.
const MobileSearchOverlay = dynamic(
  () => import("./mobile-search-overlay").then((m) => m.MobileSearchOverlay),
  { ssr: false }
);

export function MobileBottomNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Mount the overlay the first time searchOpen flips true, then keep it mounted
  // so AnimatePresence exit animations still run on close.
  const [overlayMounted, setOverlayMounted] = useState(false);

  const openSearch = () => {
    setOverlayMounted(true);
    setSearchOpen(true);
  };

  const handleNavClick = (href: string, isAction?: boolean) => {
    if (isAction || href === "#search") {
      openSearch();
      return;
    }
  };

  return (
    <>
      {/* Search Overlay — only loads after first tap */}
      {overlayMounted && (
        <MobileSearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        {/* Gradient fade above nav */}
        <div className="h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="bg-background/95 backdrop-blur-lg border-t">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
            {navItems.map((item) => {
              const isActive =
                !item.isAction && (pathname === item.href || pathname?.startsWith(`${item.href}/`));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.isAction ? "#" : item.href}
                  onClick={(e) => {
                    if (item.isAction) {
                      e.preventDefault();
                      handleNavClick(item.href, true);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 min-w-[60px] h-14 rounded-xl transition-all",
                    item.isAction
                      ? "bg-primary text-primary-foreground -mt-6 shadow-lg shadow-primary/30 size-14 min-w-[56px] rounded-full"
                      : isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-transform",
                      item.isAction ? "size-6" : "size-5",
                      isActive && !item.isAction && "scale-110"
                    )}
                  />
                  <span className={cn("text-[10px] font-medium", item.isAction && "sr-only")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe-area-inset-bottom bg-background" />
        </div>
      </nav>

      {/* Spacer for content to not be hidden behind bottom nav */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
