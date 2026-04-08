import { Suspense } from "react";
import { fetchRecords, TABLES } from "@/lib/lark-base";
import { recordToCreator } from "@/lib/cached-data";
import { KOLsListClient } from "./kols-list-client";

export const revalidate = 300;

export default function KOLsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <KOLsContent />
    </Suspense>
  );
}

async function KOLsContent() {
  const { data, total } = await fetchRecords(TABLES.ALL_KOLS, {
    pageSize: 50,
    tags: ["kols"],
  });

  return <KOLsListClient initialKOLs={data.map(recordToCreator)} total={total} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
