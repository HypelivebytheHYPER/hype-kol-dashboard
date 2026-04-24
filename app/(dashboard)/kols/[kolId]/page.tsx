import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadKOLProfile } from "@/lib/record-mappers";
import { KOLProfileClient } from "./kol-profile-client";

export const revalidate = 300; // = REVALIDATE_SECONDS

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

  // Schema.org Person structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: kol.name,
    alternateName: kol.handle,
    description:
      kol.bio?.en || kol.bio?.th || `${kol.name} is a ${kol.tier} ${kol.platform} creator`,
    image: kol.image,
    url: `https://hype-kol-dashboard.vercel.app/kols/${kol.id}`,
    jobTitle: kol.kolType,
    sameAs: kol.channel ? [kol.channel] : undefined,
    knowsAbout: kol.categories,
    aggregateRating: kol.qualityScore > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: kol.qualityScore.toFixed(1),
          bestRating: "5",
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KOLProfileClient kol={kol} />
    </>
  );
}
