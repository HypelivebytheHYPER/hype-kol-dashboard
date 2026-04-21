"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV } from "@/lib/nav-items";

interface NavLinksProps {
  onNavigate?: () => void;
  linkClassName?: string;
}

export function NavLinks({ onNavigate, linkClassName }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-0.5">
      {PRIMARY_NAV.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              linkClassName
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-foreground" />
            )}
            <item.icon
              className={cn(
                "w-4 h-4 transition-colors duration-200",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
