import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import enMessages from "@/locales/en.json";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HypeCreators Dashboard",
  description: "Discover and manage creators, live sellers, and tech talent",
  other: {
    "http-equiv": "x-dns-prefetch-control",
    content: "on",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://unavatar.io" />
        <link rel="dns-prefetch" href="https://unavatar.io" />
        <link rel="preconnect" href="https://lark-http-hype.hypelive.workers.dev" />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider>
          <I18nProvider initialMessages={enMessages}>
              {children}
              <Toaster position="bottom-right" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
