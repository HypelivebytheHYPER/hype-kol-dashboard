import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/contexts/theme-provider";
import { I18nProvider } from "@/contexts/i18n-context";
import { BRAND } from "@/lib/brand";
import { SERVICES } from "@/lib/external-services";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${BRAND.name} Dashboard`, template: `%s — ${BRAND.name}` },
  description: "Discover and manage creators, live sellers, and tech talent",
  metadataBase: new URL("https://hype-kol-dashboard.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: `${BRAND.name} Dashboard`,
    description: "Discover and manage creators, live sellers, and tech talent",
    type: "website",
    url: "/",
    images: [{ url: BRAND.logoUrl, alt: `${BRAND.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} Dashboard`,
    description: "Discover and manage creators, live sellers, and tech talent",
    images: [BRAND.logoUrl],
  },
  icons: {
    icon: BRAND.logoUrl,
    shortcut: BRAND.logoUrl,
    apple: BRAND.logoUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href={SERVICES.larkWorker} />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
