import type { Metadata } from "next";
import { HypeStudioClient } from "./hypestudio-client";
import { loadStudioList } from "@/lib/record-mappers";

const OG_IMAGE =
  "https://pub-6b552d9c3c0f4ef0ba8e32adfb058578.r2.dev/Hypestudio01.jpg";

export const metadata: Metadata = {
  title: "HypeStudio — HypeCreators",
  description:
    "The creative engine behind HypeCreators. Full-service studio for TikTok-native content, live commerce production, and creator brand partnerships.",
  alternates: {
    canonical: "https://hype-kol-dashboard.vercel.app/hypestudio",
  },
  openGraph: {
    title: "HypeStudio — HypeCreators",
    description:
      "The creative engine behind HypeCreators. Full-service studio for TikTok-native content, live commerce production, and creator brand partnerships.",
    url: "https://hype-kol-dashboard.vercel.app/hypestudio",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "HypeStudio creative production space in Bangkok",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HypeStudio — HypeCreators",
    description:
      "The creative engine behind HypeCreators. Full-service studio for TikTok-native content, live commerce production, and creator brand partnerships.",
    images: [OG_IMAGE],
  },
};

export default async function HypeStudioPage() {
  const studios = await loadStudioList();

  return (
    <>
      <HypeStudioClient studios={studios} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "HypeStudio",
            url: "https://hype-kol-dashboard.vercel.app/hypestudio",
            logo: "https://pub-816814216dff403d8cc6955bb0ad1fec.r2.dev/Hypeshop%20transparent.png",
            description:
              "Full-service studio for TikTok-native content, live commerce production, and creator brand partnerships.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bangkok",
              addressCountry: "TH",
            },
            sameAs: [
              "https://www.tiktok.com/@hypelive",
              "https://www.instagram.com/hypelive",
            ],
            areaServed: {
              "@type": "City",
              name: "Bangkok",
            },
          }),
        }}
      />
    </>
  );
}
