import type { NextConfig } from "next";
import { SERVICES, hostOf } from "./lib/external-services";

const LARK_WORKER_HOST = hostOf(SERVICES.larkWorker);
const R2_BRAND_HOST = hostOf(SERVICES.r2Brand);
const R2_STUDIO_HOST = hostOf(SERVICES.r2Studio);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // reactCompiler disabled — caused hydration issues with invalid nested buttons in MCCard
  // re-enable after React Compiler v1 stabilizes and codebase is audited for HTML validity
  // reactCompiler: true,
  logging: {
    browserToTerminal: "warn",
  },
  experimental: {
    sri: { algorithm: "sha256" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: R2_BRAND_HOST, pathname: "/**" },
      { protocol: "https", hostname: R2_STUDIO_HOST, pathname: "/**" },
      { protocol: "https", hostname: LARK_WORKER_HOST, pathname: "/api/image/**" },
      { protocol: "https", hostname: "*.larksuite.com", pathname: "/**" },
      { protocol: "https", hostname: "*.tiktokcdn.com", pathname: "/**" },
      { protocol: "https", hostname: "*.tiktokcdn-eu.com", pathname: "/**" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async rewrites() {
    return [
      { source: "/", destination: "/kols" },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/lark/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.tiktok.com/embed.js *.tiktok.com *.ttwstatic.com",
              "style-src 'self' 'unsafe-inline' *.ttwstatic.com",
              `img-src 'self' blob: data: https: ${LARK_WORKER_HOST} ${R2_BRAND_HOST} ${R2_STUDIO_HOST} *.tiktokcdn.com *.tiktokcdn-eu.com`,
              `media-src 'self' ${LARK_WORKER_HOST} ${R2_STUDIO_HOST} ${SERVICES.larkCDNHost}`,
              `connect-src 'self' ${LARK_WORKER_HOST} ${SERVICES.larkCDNHost} *.tiktok.com`,
              "font-src 'self'",
              "object-src 'none'",
              "child-src 'self' *.tiktok.com *.ttwstatic.com",
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
