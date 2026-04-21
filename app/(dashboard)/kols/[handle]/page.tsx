import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { loadKOLProfileByHandle } from "@/lib/record-mappers";
import { BRAND } from "@/lib/brand";

// Dynamically load KOL profile (ships recharts) only on this route.
// Keeps recharts out of the shared vendor chunk consumed by /kols and /live.
const KOLProfileClient = dynamic(
  () => import("./kol-profile-client").then((m) => m.KOLProfileClient),
  { ssr: true }
);

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const kol = await loadKOLProfileByHandle(handle);
  if (!kol) return { title: "Not Found" };

  const title = `${kol.name} (@${kol.handle}) — ${BRAND.name}`;
  const description =
    kol.bio?.en ||
    kol.bio?.th ||
    `${kol.name} is a ${kol.tier} ${kol.platform} creator with ${kol.followers.toLocaleString()} followers. View performance metrics, rate card, and contact details.`;
  const url = `https://hype-kol-dashboard.vercel.app/kols/${encodeURIComponent(kol.handle)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: kol.image ? [{ url: kol.image, alt: kol.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: kol.image ? [kol.image] : undefined,
    },
  };
}

export default async function KOLProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const kol = await loadKOLProfileByHandle(handle);
  if (!kol) notFound();

  return <KOLProfileClient kol={kol} />;
}
