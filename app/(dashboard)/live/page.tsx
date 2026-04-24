import type { Metadata } from "next";
import { fetchRecords, TABLES, buildMediaUrls } from "@/lib/lark-base";
import { recordToLiveMC, loadKOLCatalog } from "@/lib/record-mappers";
import { LiveCatalogClient } from "./live-catalog-client";

export const metadata: Metadata = {
  title: "Live MC Catalog",
  description:
    "Browse live MCs with video references and brand experience. Filter by content category and view portfolio wire maps.",
  alternates: { canonical: "https://hype-kol-dashboard.vercel.app/live" },
  openGraph: {
    title: "Live MC Catalog — HypeCreators",
    description:
      "Browse live MCs with video references and brand experience. Filter by content category and view portfolio wire maps.",
    url: "/live",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live MC Catalog — HypeCreators",
    description:
      "Browse live MCs with video references and brand experience. Filter by content category and view portfolio wire maps.",
  },
};

export const revalidate = 300; // = REVALIDATE_SECONDS

// Route-level fallback lives in `./loading.tsx` — no Suspense wrapper here.
export default async function LiveCatalogPage() {
  const [result, { creators }] = await Promise.all([
    fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"] }),
    loadKOLCatalog(),
  ]);

  // Build handle → avatar image map from KOL catalog
  const imageByHandle = new Map<string, string>();
  for (const c of creators) {
    const key = (c.handle || c.name).toLowerCase().trim();
    if (c.image && key) imageByHandle.set(key, c.image);
  }

  const mcs = result.data.map(recordToLiveMC).map((mc) => {
    const image = imageByHandle.get(mc.handle.toLowerCase().trim());
    return image ? { ...mc, image } : mc;
  });

  const videoTokens: string[] = [];
  for (const mc of mcs) for (const v of mc.videos) videoTokens.push(v.token);
  const videoUrls = buildMediaUrls(videoTokens, TABLES.LIVE_MC_LIST);

  return <LiveCatalogClient mcs={mcs} videoUrls={videoUrls} />;
}
