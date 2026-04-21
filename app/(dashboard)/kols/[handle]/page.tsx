import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { loadKOLProfileByHandle } from "@/lib/record-mappers";

// Dynamically load KOL profile (ships recharts) only on this route.
// Keeps recharts out of the shared vendor chunk consumed by /kols and /live.
const KOLProfileClient = dynamic(
  () => import("./kol-profile-client").then((m) => m.KOLProfileClient),
  { ssr: true }
);

export const revalidate = 300;

export default async function KOLProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const kol = await loadKOLProfileByHandle(handle);
  if (!kol) notFound();

  return <KOLProfileClient kol={kol} />;
}
