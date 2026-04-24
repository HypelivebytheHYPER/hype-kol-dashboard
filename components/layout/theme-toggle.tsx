"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useToggleTheme } from "@/contexts/theme-provider";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  title?: string;
}

export function ThemeToggle({ className, title }: ThemeToggleProps) {
  const { toggle } = useToggleTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch — render a layout-preserving placeholder.
  if (!mounted) {
    return <div className={cn("size-8", className)} aria-hidden="true" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      title={title}
      aria-label={title ?? "Toggle theme"}
      onClick={toggle}
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}
