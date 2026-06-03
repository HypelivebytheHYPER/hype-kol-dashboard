import type { MetadataRoute } from "next";
import { loadKOLCatalog } from "@/lib/record-mappers";
export const revalidate = 300; // = REVALIDATE_SECONDS

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hype-kol-dashboard.vercel.app";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kols`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/live`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Dynamic KOL profile routes (by record_id)
  // Graceful fallback: if LARK_BASE_TOKEN is missing at build time, return static routes only
  let kolRoutes: MetadataRoute.Sitemap = [];
  try {
    const { creators } = await loadKOLCatalog();
    kolRoutes = creators.map((kol) => ({
      url: `${base}/kols/${kol.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    console.warn("[sitemap] KOL catalog unavailable at build time:", e);
  }

  return [...staticRoutes, ...kolRoutes];
}
