"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Radio, Briefcase, Search, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "KOLs", href: "/kols", icon: Users },
  { name: "Search", href: "#search", icon: Search, isAction: true },
  { name: "Live", href: "/live", icon: Radio },
  { name: "Campaigns", href: "/campaigns", icon: Briefcase },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavClick = (href: string, isAction?: boolean) => {
    if (isAction || href === "#search") {
      setSearchOpen(true);
      return;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kols?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Search KOLs, campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                </form>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="p-4 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Quick Search</p>
                <div className="flex flex-wrap gap-2">
                  {["Beauty", "Tech", "Live Sellers", "Mega", "Micro"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        router.push(`/kols?category=${encodeURIComponent(tag)}`);
                        setSearchOpen(false);
                      }}
                      className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches - could be populated from localStorage */}
              <div className="flex-1 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">Popular</p>
                <div className="space-y-2">
                  {[
                    { label: "Top Live Sellers", href: "/kols?tier=live" },
                    { label: "Beauty KOLs", href: "/kols?category=beauty" },
                    { label: "High GMV", href: "/kols?sort=gmv" },
                    { label: "My Campaigns", href: "/campaigns" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Command className="w-4 h-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      ? "bg-primary text-primary-foreground -mt-6 shadow-lg shadow-primary/30 h-14 w-14 min-w-[56px] rounded-full"
                      : isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-transform",
                      item.isAction ? "w-6 h-6" : "w-5 h-5",
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
