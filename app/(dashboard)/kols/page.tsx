import { loadKOLCatalog } from "@/lib/record-mappers";
import { KOLsListClient } from "./kols-list-client";

export const revalidate = 300;

// Route-level fallback lives in `./loading.tsx` — no Suspense wrapper here.
// `loadKOLCatalog` fetches + parses the full catalog. Underlying fetch()
// uses Next.js cache tags, so HTTP responses are deduped across pages.
export default async function KOLsPage() {
  const { creators } = await loadKOLCatalog();
  return <KOLsListClient initialKOLs={creators} total={creators.length} />;
}
