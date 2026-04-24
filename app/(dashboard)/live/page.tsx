import type { Metadata } from "next";
import { fetchRecords, TABLES } from "@/lib/lark-base";
import { recordToLiveMC } from "@/lib/record-mappers";
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

export const dynamic = "force-dynamic";

// Route-level fallback lives in `./loading.tsx` — no Suspense wrapper here.
export default async function LiveCatalogPage() {
  const result = await fetchRecords(TABLES.LIVE_MC_LIST, { tags: ["live-mc"], cache: "no-store" });
  const mcs = result.data.map(recordToLiveMC);

  return <LiveCatalogClient mcs={mcs} />;
}
