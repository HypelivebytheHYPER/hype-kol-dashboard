import { Users, Video, Radio, Search, LayoutDashboard, Sparkles, type LucideIcon } from "lucide-react";
import { ROUTES } from "./constants";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  isAction?: boolean;
}

// Primary navigation — used by Sidebar (desktop) + MobileSidebar (drawer).
// Single source of truth; adding a route here shows up in both.
export const PRIMARY_NAV: readonly NavItem[] = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: "Creators", href: ROUTES.KOLS, icon: Users },
  { name: "Live Catalog", href: ROUTES.LIVE, icon: Video },
  { name: "HypeStudio", href: ROUTES.HYPESTUDIO, icon: Sparkles },
] as const;

// Mobile bottom nav — different shape (shorter labels, different icons, has
// search action). Kept separate because the UX is genuinely different from
// the primary nav, not a presentation variant.
export const MOBILE_BOTTOM_NAV: readonly NavItem[] = [
  { name: "Creators", href: ROUTES.KOLS, icon: Users },
  { name: "Search", href: "#search", icon: Search, isAction: true },
  { name: "Live", href: ROUTES.LIVE, icon: Radio },
  { name: "Studio", href: ROUTES.HYPESTUDIO, icon: Sparkles },
] as const;
