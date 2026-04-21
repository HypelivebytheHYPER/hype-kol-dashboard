"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

// Premium gradient combinations for different name initials
// Each combination is carefully selected for aesthetic appeal and accessibility
const GRADIENT_PAIRS = [
  { from: "from-violet-500", to: "to-fuchsia-500", bg: "bg-violet-500" },
  { from: "from-blue-500", to: "to-cyan-500", bg: "bg-blue-500" },
  { from: "from-emerald-500", to: "to-teal-500", bg: "bg-emerald-500" },
  { from: "from-orange-500", to: "to-amber-500", bg: "bg-orange-500" },
  { from: "from-rose-500", to: "to-pink-500", bg: "bg-rose-500" },
  { from: "from-indigo-500", to: "to-purple-500", bg: "bg-indigo-500" },
  { from: "from-cyan-500", to: "to-sky-500", bg: "bg-cyan-500" },
  { from: "from-lime-500", to: "to-green-500", bg: "bg-lime-500" },
  { from: "from-amber-500", to: "to-yellow-500", bg: "bg-amber-500" },
  { from: "from-red-500", to: "to-orange-500", bg: "bg-red-500" },
  { from: "from-fuchsia-500", to: "to-purple-500", bg: "bg-fuchsia-500" },
  { from: "from-sky-500", to: "to-blue-500", bg: "bg-sky-500" },
  { from: "from-teal-500", to: "to-emerald-500", bg: "bg-teal-500" },
  { from: "from-pink-500", to: "to-rose-500", bg: "bg-pink-500" },
  { from: "from-purple-500", to: "to-violet-500", bg: "bg-purple-500" },
];

// Get a deterministic gradient based on the name string
function getGradientForName(name: string) {
  if (!name) return GRADIENT_PAIRS[0];
  // Create a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
}

// Get initials from name (up to 2 characters)
function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  // Take first letter of first and last name parts
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PremiumAvatarProps {
  src?: string | undefined;
  name: string;
  className?: string;
  fallbackClassName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  ringColor?: string;
}

const SIZE_MAP = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function PremiumAvatar({
  src,
  name,
  className,
  fallbackClassName,
  size = "md",
  ring = false,
  ringColor = "ring-primary/20",
}: PremiumAvatarProps) {
  const gradient = getGradientForName(name);
  const initials = getInitials(name);
  const sizeClasses = SIZE_MAP[size];

  return (
    <Avatar className={cn(sizeClasses, "shrink-0", ring && `ring-2 ${ringColor}`, className)}>
      <AvatarImage src={src} className="object-cover" />
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br",
          gradient.from,
          gradient.to,
          "text-white font-semibold",
          "shadow-inner",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

