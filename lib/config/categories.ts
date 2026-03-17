// Category configuration for KOL discovery
import type { LucideIcon } from "lucide-react";
import { Sparkles, Smartphone, Shirt, UtensilsCrossed, Home, Heart } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "beauty",
    name: "Beauty & Skincare",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    type: "beauty",
  },
  {
    id: "tech",
    name: "Tech & Gadgets",
    icon: Smartphone,
    color: "from-blue-500 to-cyan-500",
    type: "tech",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    color: "from-purple-500 to-violet-500",
    type: "fashion",
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: UtensilsCrossed,
    color: "from-orange-500 to-amber-500",
    type: "food",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    icon: Home,
    color: "from-green-500 to-emerald-500",
    type: "lifestyle",
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: Heart,
    color: "from-teal-500 to-cyan-500",
    type: "health",
  },
];

// Get category by ID
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// Get category name by ID
export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? id;
}
