import { Suspense } from "react";
import { fetchRecords, TABLES, resolveFileUrls } from "@/lib/lark-base";
import { recordToLiveMC } from "@/lib/cached-data";
import { LiveCatalogClient } from "./live-catalog-client";

export const revalidate = 300;

export default function LiveCatalogPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LiveContent />
    </Suspense>
  );
}

async function LiveContent() {
  const { data } = await fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"] });
  const mcs = data.map(recordToLiveMC);

  const videoTokens = mcs.map((mc) => mc.videos[0]?.token).filter(Boolean);
  const videoUrls = await resolveFileUrls(videoTokens);

  return <LiveCatalogClient mcs={mcs} videoUrls={videoUrls} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[9/16] bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
