import { Suspense } from "react";
import { getPopularKOLs, getLiveSellers, getCategoryKOLs } from "@/lib/cached-data";
import DiscoveryHubClient from "./DiscoveryHubClient";
import { LoadingDashboard } from "@/components/loading-dashboard";

// ISR: Regenerate page every 5 minutes in background
export const revalidate = 300;

// Force dynamic if you need real-time data, but with caching we get best of both
// export const dynamic = "force-dynamic";

/**
 * Server Component with Next.js 16 "use cache"
 * First visitor triggers fetch (~1-2s), subsequent get edge-cached version (<100ms)
 */
export default async function DiscoveryHubPage() {
  // Fetch data in parallel with edge caching
  const [kolsData, sellersData, beautyData, techData, fashionData, foodData] = await Promise.all([
    getPopularKOLs(),
    getLiveSellers(),
    getCategoryKOLs("beauty"),
    getCategoryKOLs("tech"),
    getCategoryKOLs("fashion"),
    getCategoryKOLs("food"),
  ]);

  // Serialize data for Client Component
  const initialData = {
    kols: kolsData,
    sellers: sellersData,
    categories: {
      beauty: beautyData,
      tech: techData,
      fashion: fashionData,
      food: foodData,
    },
  };

  return (
    <Suspense fallback={<LoadingDashboard />}>
      <DiscoveryHubClient initialData={initialData} />
    </Suspense>
  );
}
