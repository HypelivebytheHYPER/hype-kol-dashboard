import type { Metadata } from "next";
import { loadKOLCatalog } from "@/lib/record-mappers";
import { KOLsListClient } from "./kols-list-client";

export const metadata: Metadata = {
  title: "Creators",
  description:
    "Browse top TikTok creators, live sellers, and tech talent. Filter by tier, category, platform, and performance metrics.",
  alternates: { canonical: "https://hype-kol-dashboard.vercel.app/kols" },
  openGraph: {
    title: "Creators — HypeCreators",
    description:
      "Browse top TikTok creators, live sellers, and tech talent. Filter by tier, category, platform, and performance metrics.",
    url: "/kols",
    type: "website",
  },
};

export const revalidate = 300; // = REVALIDATE_SECONDS

// `loadKOLCatalog` fetches + parses the full catalog. Underlying fetch()
// uses Next.js cache tags, so HTTP responses are deduped across pages.
export default async function KOLsPage() {
  const { creators } = await loadKOLCatalog();
  return <KOLsListClient initialKOLs={creators} total={creators.length} />;
}
