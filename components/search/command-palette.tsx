"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  Users,
  Sparkles,
  Video,
  Cpu,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Creators", href: "/kols", icon: Users, shortcut: "⌘K" },
  { name: "Tech Creators", href: "/tech", icon: Cpu, shortcut: "⌘T" },
  { name: "Live Catalog", href: "/live", icon: Video, shortcut: "⌘L" },
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
        placeholder="Search creators, navigate..."
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

        {!search && (
          <CommandGroup heading="Smart Search">
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

        <CommandGroup heading="Navigation">
          {navigation.map((item) => (
            <CommandItem key={item.name} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        {search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Search">
              <CommandItem onSelect={() => handleSearch(search)}>
                <Users className="mr-2 h-4 w-4" />
                <span>Search &quot;{search}&quot; in Creators</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
