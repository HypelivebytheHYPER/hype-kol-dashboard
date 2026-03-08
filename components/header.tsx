"use client";

import { useState } from "react";
import { Search, Bell, Command } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/search/command-palette";

export function Header() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="outline"
            className="w-64 justify-between text-muted-foreground"
            onClick={() => setCommandOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="text-sm">Search anything...</span>
            </div>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">hype@agency.com</p>
            </div>
            <Avatar>
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
