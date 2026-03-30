import { Suspense } from "react";
import { fetchRecords, TABLES, recordToKOL } from "@/lib/cached-data";
import { KOLsListClient } from "./kols-list-client";

export const revalidate = 300;

export default async function KOLsPage() {
  const { data, total } = await fetchRecords(TABLES.ALL_KOLS, { pageSize: 50, tags: ["kols"] });

  return (
    <Suspense fallback={<PageSkeleton />}>
      <KOLsListClient initialKOLs={data.map(recordToKOL)} total={total} />
    </Suspense>
  );
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
