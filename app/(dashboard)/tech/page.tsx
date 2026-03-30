import { Suspense } from "react";
import { getTechKOLs } from "@/lib/cached-data";
import { TechKOLClient } from "./tech-kol-client";

export const revalidate = 300;

export default async function TechKOLPage() {
  const { data: kols, total } = await getTechKOLs();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <TechKOLClient kols={kols} total={total} />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
