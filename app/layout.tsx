import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers";
import { I18nProvider } from "@/components/providers";
import { BRAND, THEME_COLOR } from "@/lib/constants";
import { Toaster } from "sonner";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${notoSansThai.variable} ${geistMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://p16-sign-sg.tiktokcdn.com" />
        <link rel="preconnect" href="https://p16-common-sign.tiktokcdn-us.com" />
        <link rel="dns-prefetch" href="https://www.tiktok.com" />
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
