"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Users,
  Radio,
  Briefcase,
  Tag,
  Map,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Live Center", href: "/live", icon: Radio },
  { name: "Campaigns", href: "/campaigns", icon: Briefcase },
  { name: "KOLs", href: "/kols", icon: Users },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "Media Planner", href: "/media-planner", icon: Map },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-lg">hype</span>
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
