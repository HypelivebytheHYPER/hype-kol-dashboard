// Campaign status configuration
import type { LucideIcon } from "lucide-react";
import { Video, Sparkles, Rocket, Crown } from "lucide-react";

export interface CampaignStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const CAMPAIGN_STATUSES: Record<string, CampaignStatusConfig> = {
  planning: {
    label: "Planning",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  active: {
    label: "Active",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  paused: {
    label: "Paused",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  completed: {
    label: "Completed",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

// Default status
export const DEFAULT_CAMPAIGN_STATUS = "planning";

// Get status config
export function getCampaignStatus(status: string | undefined): CampaignStatusConfig {
  return (
    CAMPAIGN_STATUSES[status ?? DEFAULT_CAMPAIGN_STATUS] ??
    CAMPAIGN_STATUSES[DEFAULT_CAMPAIGN_STATUS]
  );
}

// Campaign type options
export const CAMPAIGN_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "live_commerce", label: "Live Commerce" },
  { value: "branded_content", label: "Branded Content" },
  { value: "product_launch", label: "Product Launch" },
];

// Campaign collection presets
export interface CollectionPreset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  filter: (kols: any[]) => any[];
}

export const COLLECTION_PRESETS: CollectionPreset[] = [
  {
    id: "live-sellers",
    name: "Live Commerce Stars",
    description: "Top-performing live sellers with 500K+ GMV",
    icon: Video,
    color: "from-red-500 to-pink-500",
    filter: (kols: any[]) => kols.filter((k) => k.avgLiveGMV > 500000).slice(0, 8),
  },
  {
    id: "micro-beauty",
    name: "Beauty Micro KOLs",
    description: "10K-100K followers, beauty specialists",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    filter: (kols: any[]) =>
      kols
        .filter(
          (k) =>
            k.tier?.includes("Micro") &&
            k.categories?.some((c: string) => c.toLowerCase().includes("beauty"))
        )
        .slice(0, 8),
  },
  {
    id: "rising-stars",
    name: "Rising Stars",
    description: "High engagement rate + growing fast",
    icon: Rocket,
    color: "from-yellow-500 to-orange-500",
    filter: (kols: any[]) =>
      kols
        .filter((k) => k.engagementRate > 5 && k.followers < 500000)
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 8),
  },
  {
    id: "mega-influencers",
    name: "Mega Influencers",
    description: "1M+ followers, premium tier",
    icon: Crown,
    color: "from-purple-500 to-violet-500",
    filter: (kols: any[]) => kols.filter((k) => k.tier?.includes("Mega")).slice(0, 8),
  },
];
