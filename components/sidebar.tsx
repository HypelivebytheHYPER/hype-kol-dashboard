"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Settings, Video, Cpu } from "lucide-react";

const navigation = [
  { name: "Creators", href: "/kols", icon: Users },
  { name: "Tech Creators", href: "/tech", icon: Cpu },
  { name: "Live Catalog", href: "/live", icon: Video },
];

const secondaryNav = [{ name: "Settings", href: "/settings", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-5">
        <Link href="/kols" className="flex items-center gap-2.5">
          <Image
            src="https://pub-816814216dff403d8cc6955bb0ad1fec.r2.dev/Hypeshop%20transparent.png"
            alt="HypeCreators"
            width={36}
            height={36}
            className="rounded-lg drop-shadow-md"
          />
          <span className="font-bold text-lg tracking-tight">HypeCreators</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        {secondaryNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
