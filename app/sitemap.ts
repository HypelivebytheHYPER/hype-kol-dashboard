import type { MetadataRoute } from "next";
import { loadKOLCatalog } from "@/lib/record-mappers";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hype-kol-dashboard.vercel.app";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kols`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/live`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Dynamic KOL profile routes
  const { creators } = await loadKOLCatalog();
  const kolRoutes: MetadataRoute.Sitemap = creators.map((kol) => ({
    url: `${base}/kols/${encodeURIComponent(kol.handle)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...kolRoutes];
}
