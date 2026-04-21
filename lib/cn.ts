import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class-name merger — clsx for conditional composition, twMerge for
 * conflict resolution (so `className="p-2"` + `"p-4"` collapses to `"p-4"`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
