import { fetchRecords, TABLES, buildMediaUrls } from "@/lib/lark-base";
import { recordToLiveMC } from "@/lib/record-mappers";
import { LiveCatalogClient } from "./live-catalog-client";

export const revalidate = 300;

// Route-level fallback lives in `./loading.tsx` — no Suspense wrapper here.
export default async function LiveCatalogPage() {
  const result = await fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"] });
  const mcs = result.data.map(recordToLiveMC);

  const videoTokens: string[] = [];
  for (const mc of mcs) for (const v of mc.videos) videoTokens.push(v.token);
  const videoUrls = buildMediaUrls(videoTokens, TABLES.LIVE_MC_LIST);

  return <LiveCatalogClient mcs={mcs} videoUrls={videoUrls} />;
}
