import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { loadKOLProfile } from "@/lib/record-mappers";

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
  params: Promise<{ kolId: string }>;
}): Promise<Metadata> {
  const { kolId } = await params;
  const kol = await loadKOLProfile(kolId);
  if (!kol) return { title: "Not Found" };

  const title = `${kol.name} (@${kol.handle})`;
  const description =
    kol.bio?.en ||
    kol.bio?.th ||
    `${kol.name} is a ${kol.tier} ${kol.platform} creator with ${kol.followers.toLocaleString()} followers. View performance metrics, rate card, and contact details.`;
  const url = `https://hype-kol-dashboard.vercel.app/kols/${kol.id}`;

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
  params: Promise<{ kolId: string }>;
}) {
  const { kolId } = await params;
  const kol = await loadKOLProfile(kolId);
  if (!kol) notFound();

  return <KOLProfileClient kol={kol} />;
}
