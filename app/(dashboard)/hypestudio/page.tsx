import type { Metadata } from "next";
import { HypeStudioClient } from "./_components/hypestudio-client";
import { loadStudioList } from "@/lib/record-mappers";
import { MAX_STUDIO_PREVIEW, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/constants";

const OG_IMAGE =
  "https://pub-6b552d9c3c0f4ef0ba8e32adfb058578.r2.dev/Hypestudio01.jpg";

export const metadata: Metadata = {
  title: "HypeStudio",
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
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
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
  let studios: import("@/lib/types").Studio[] = [];
  try {
    studios = (await loadStudioList()).slice(0, MAX_STUDIO_PREVIEW);
  } catch (e) {
    console.warn("[HypeStudio] Studio list unavailable at build time:", e);
  }

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
