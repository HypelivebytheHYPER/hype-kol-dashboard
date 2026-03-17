"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

interface AddToCampaignDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedKOLs?: Array<{ id: string; name: string; handle: string }>;
  preselectedCampaignId?: string;
}

// Loading fallback for the dialog
function DialogSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

// Dynamically import the dialog component
const DynamicAddToCampaignDialog = dynamic(
  () => import("./add-to-campaign-dialog").then((mod) => mod.AddToCampaignDialog),
  {
    ssr: false,
    loading: DialogSkeleton,
  }
);

export function AddToCampaignDialog(props: AddToCampaignDialogProps) {
  return <DynamicAddToCampaignDialog {...props} />;
}
