import type { NextConfig } from "next";
import { SERVICES, hostOf } from "./lib/external-services";

// Pre-compute hosts once — used in both remotePatterns and CSP directives.
const LARK_WORKER_HOST = hostOf(SERVICES.larkWorker);
const R2_BRAND_HOST = hostOf(SERVICES.r2Brand);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  logging: {
    browserToTerminal: "warn",
  },
  experimental: {
    sri: { algorithm: "sha256" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: R2_BRAND_HOST, pathname: "/**" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Rewrite `/` → `/kols` at the edge. No redirect, no extra round-trip;
  // user's browser sees the URL stay `/` and receives the creators-list page
  // directly from Vercel's cache. Replaces the old SSR `redirect()` that cost ~150ms.
  async rewrites() {
    return [
      { source: "/", destination: "/kols" },
    ];
  },
  async headers() {
    return [
      // CDN Caching: API routes - 60s fresh, 5min stale-while-revalidate
      {
        source: "/api/lark/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      // CDN Caching: Static assets - 1 year immutable
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' blob: data: https: ${LARK_WORKER_HOST} ${R2_BRAND_HOST}`,
              `media-src 'self' ${LARK_WORKER_HOST} ${SERVICES.larkCDNHost}`,
              `connect-src 'self' ${LARK_WORKER_HOST} ${SERVICES.larkCDNHost}`,
              "font-src 'self'",
              "object-src 'none'",
              "child-src 'none'",
              "frame-ancestors 'self' https://www.hypelive.io https://hypelive.io https://hypelive-rate-card.vercel.app",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
