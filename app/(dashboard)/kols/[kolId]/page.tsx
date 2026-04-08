import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchRecords, TABLES } from "@/lib/lark-base";
import { recordToCreator } from "@/lib/cached-data";
import { KOLProfileClient } from "./kol-profile-client";

export const revalidate = 300;

export default async function KOLProfilePage({ params }: { params: Promise<{ kolId: string }> }) {
  const { kolId } = await params;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfileContent kolId={kolId} />
    </Suspense>
  );
}

async function ProfileContent({ kolId }: { kolId: string }) {
  const { data } = await fetchRecords(TABLES.ALL_KOLS, {
    filter: { conjunction: "and", conditions: [{ field_name: "Record ID", operator: "is", value: [kolId] }] },
    pageSize: 1,
    tags: ["kols"],
  });

  const kolData = data[0] ? recordToCreator(data[0]) : null;
  if (!kolData) notFound();

  return <KOLProfileClient kol={kolData} related={{ parent: null, children: [] }} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      <div className="rounded-2xl overflow-hidden border border-border/60">
        <div className="h-32 bg-muted animate-pulse" />
        <div className="p-6 -mt-12 flex gap-4">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 pt-12">
            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
