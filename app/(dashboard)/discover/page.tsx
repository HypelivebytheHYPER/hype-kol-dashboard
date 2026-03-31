import { Suspense } from "react";
import { fetchRecords, TABLES, recordToCreator } from "@/lib/cached-data";
import { DiscoverClient } from "./discover-client";

export const revalidate = 300;

export default async function DiscoverPage() {
  const { data } = await fetchRecords(TABLES.ALL_KOLS, { pageSize: 50, tags: ["kols"] });

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DiscoverClient initialKOLs={data.map(recordToCreator)} />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
