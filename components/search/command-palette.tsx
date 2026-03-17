"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Search,
  Users,
  Radio,
  Briefcase,
  Settings,
  User,
  TrendingUp,
  Clock,
  Sparkles,
  Building2,
} from "lucide-react";
import { useKOLs } from "@/hooks";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { getRecentSearches } from "@/lib/smart-search";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard, shortcut: "⌘H" },
  { name: "KOLs", href: "/kols", icon: Users, shortcut: "⌘K" },
  { name: "Live Center", href: "/live", icon: Radio, shortcut: "⌘L" },
  { name: "Campaigns", href: "/campaigns", icon: Briefcase, shortcut: "⌘C" },
  { name: "OOH Media", href: "/ooh", icon: Building2 },
];

const smartSearchExamples = [
  { query: "beauty micro bangkok", description: "Category + tier + location" },
  { query: ">100k followers live", description: "Follower threshold + type" },
  { query: "tiktok nano fashion", description: "Platform + tier + category" },
  { query: ">5% engagement", description: "Engagement rate filter" },
  { query: "has line contact", description: "With contact info" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: kolsData } = useKOLs();
  const recentSearches = typeof window !== "undefined" ? getRecentSearches() : [];

  const kols = kolsData?.data || [];

  // Filter KOLs based on search
  const filteredKOLs = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    return kols
      .filter(
        (kol) =>
          kol.name?.toLowerCase().includes(q) ||
          kol.handle?.toLowerCase().includes(q) ||
          kol.categories?.some((c) => c.toLowerCase().includes(q)) ||
          kol.location?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [search, kols]);

  // Get trending KOLs (highest GMV)
  const trendingKOLs = useMemo(() => {
    return [...kols].sort((a, b) => (b.avgGMV || 0) - (a.avgGMV || 0)).slice(0, 5);
  }, [kols]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
    setSearch("");
  };

  const handleSearch = (query: string) => {
    onOpenChange(false);
    router.push(`/kols?q=${encodeURIComponent(query)}`);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search KOLs, navigate, or try smart queries..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Press Enter to search &quot;{search}&quot;
            </p>
          </div>
        </CommandEmpty>

        {/* Smart Search Examples */}
        {!search && (
          <CommandGroup heading="Smart Search Examples">
            {smartSearchExamples.map((example) => (
              <CommandItem key={example.query} onSelect={() => handleSearch(example.query)}>
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                <span>{example.query}</span>
                <span className="ml-2 text-xs text-muted-foreground">{example.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navigation.map((item) => (
            <CommandItem key={item.name} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Recent Searches */}
        {!search && recentSearches.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.slice(0, 5).map((s) => (
              <CommandItem key={s} onSelect={() => handleSearch(s)}>
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{s}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Real-time KOL Search Results */}
        {search && filteredKOLs.length > 0 && (
          <CommandGroup heading={`KOLs (${filteredKOLs.length} found)`}>
            {filteredKOLs.map((kol) => (
              <CommandItem key={kol.id} onSelect={() => handleSelect(`/kols/${kol.id}`)}>
                <User className="mr-2 h-4 w-4" />
                <span>{kol.name}</span>
                <span className="ml-2 text-muted-foreground">@{kol.handle}</span>
                <span className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {kol.tier?.replace(" KOL", "")}
                  </Badge>
                  <span className="font-mono text-xs">{formatNumber(kol.followers)}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Trending KOLs */}
        {!search && trendingKOLs.length > 0 && (
          <CommandGroup heading="Trending Now (Top GMV)">
            {trendingKOLs.map((kol) => (
              <CommandItem key={kol.id} onSelect={() => handleSelect(`/kols/${kol.id}`)}>
                <User className="mr-2 h-4 w-4" />
                <span>{kol.name}</span>
                <span className="ml-2 text-muted-foreground">@{kol.handle}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="font-mono text-xs text-green-500">
                    {formatCurrency(kol.avgGMV || 0)}
                  </span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
