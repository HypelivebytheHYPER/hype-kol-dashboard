"use client";

import { useRouter } from "next/navigation";
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
  Tag,
  Map,
  Settings,
  User,
  TrendingUp,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard, shortcut: "⌘H" },
  { name: "Discovery", href: "/discovery", icon: Search, shortcut: "⌘D" },
  { name: "Live Center", href: "/live", icon: Radio, shortcut: "⌘L" },
  { name: "Campaigns", href: "/campaigns", icon: Briefcase, shortcut: "⌘C" },
  { name: "KOLs", href: "/kols", icon: Users, shortcut: "⌘K" },
  { name: "Pricing", href: "/pricing", icon: Tag, shortcut: "⌘P" },
  { name: "Media Planner", href: "/media-planner", icon: Map },
];

const trendingKOLs = [
  { name: "Mintra", handle: "@mintrako8764", gmv: "฿450K", trend: "+12%" },
  { name: "Winwin Center", handle: "@winwincenter", gmv: "฿380K", trend: "+8%" },
  { name: "Pimprapa", handle: "@pimprapa", gmv: "฿290K", trend: "+23%" },
];

const recentSearches = [
  "beauty > micro",
  "live seller > 1m",
  "gen z > bangkok",
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search KOLs, campaigns, or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigation.map((item) => (
            <CommandItem
              key={item.name}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Trending Now">
          {trendingKOLs.map((kol) => (
            <CommandItem
              key={kol.handle}
              onSelect={() => handleSelect(`/kols/${kol.handle}`)}
            >
              <User className="mr-2 h-4 w-4" />
              <span>{kol.name}</span>
              <span className="ml-2 text-muted-foreground">{kol.handle}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="font-mono text-xs">{kol.gmv}</span>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">{kol.trend}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Searches">
          {recentSearches.map((search) => (
            <CommandItem
              key={search}
              onSelect={() => handleSelect(`/discovery?q=${search}`)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>{search}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
