import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(0)}K`;
  return `฿${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export function getTierColor(tier: string): string {
  const t = tier.toLowerCase();
  if (t.includes("mega")) return "bg-pink-500";
  if (t.includes("macro")) return "bg-purple-500";
  if (t.includes("mid")) return "bg-indigo-500";
  if (t.includes("micro")) return "bg-blue-500";
  if (t.includes("nano")) return "bg-slate-500";
  return "bg-gray-500";
}

export function getCreatorImageUrl(kol: { handle?: string; platform?: string }): string {
  const handle = kol.handle?.trim().replace(/^@/, "");
  if (!handle) return "";
  const p = (kol.platform || "").toLowerCase();
  if (p.includes("instagram")) return `https://unavatar.io/instagram/${handle}`;
  if (p.includes("youtube")) return `https://unavatar.io/youtube/${handle}`;
  if (p.includes("facebook")) return `https://unavatar.io/facebook/${handle}`;
  return `https://unavatar.io/tiktok/${handle}`;
}
