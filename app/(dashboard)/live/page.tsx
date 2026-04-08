import { Suspense } from "react";
import { fetchRecords, TABLES, resolveFileUrls } from "@/lib/lark-base";
import { recordToLiveMC } from "@/lib/cached-data";
import { LiveCatalogClient } from "./live-catalog-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { larkKeys } from "@/lib/hooks/use-lark-data";

export const revalidate = 300;

export default function LiveCatalogPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LiveContent />
    </Suspense>
  );
}

async function LiveContent() {
  // Prefetch data on server for instant initial render
  await queryClient.prefetchQuery({
    queryKey: larkKeys.records(TABLES.LIVE_MC_LIST),
    queryFn: async () => {
      const result = await fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"] });
      return result.data.map(recordToLiveMC);
    },
  });

  const mcs = queryClient.getQueryData(larkKeys.records(TABLES.LIVE_MC_LIST)) || [];
  
  const videoTokens = mcs.map((mc: { videos: { token: string }[] }) => mc.videos[0]?.token).filter(Boolean);
  
  // Prefetch video URLs
  await Promise.all(
    videoTokens.map((token: string) =>
      queryClient.prefetchQuery({
        queryKey: larkKeys.fileUrl(token),
        queryFn: () => resolveFileUrls([token]).then((urls) => urls[token]),
        staleTime: 1000 * 60 * 60 * 23,
      })
    )
  );

  const videoUrls: Record<string, string> = {};
  videoTokens.forEach((token: string) => {
    const url = queryClient.getQueryData(larkKeys.fileUrl(token));
    if (url) videoUrls[token] = url;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveCatalogClient mcs={mcs} videoUrls={videoUrls} />
    </HydrationBoundary>
  );
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
