// External service endpoints — single source of truth.
// One string per service. Callers that need just the host derive it with
// `hostOf()`; next.config.ts CSP + remotePatterns call it the same way.

export const SERVICES = {
  // Lark data/media worker (Cloudflare). Open-mode REST proxy to Lark Base.
  larkWorker: "https://lark-http-hype.hypelive.workers.dev",

  // Hypelive brand-asset bucket (Cloudflare R2, public).
  r2Brand: "https://pub-816814216dff403d8cc6955bb0ad1fec.r2.dev",

  // HypeStudio content bucket (Cloudflare R2, public).
  r2Studio: "https://pub-6b552d9c3c0f4ef0ba8e32adfb058578.r2.dev",

  // Lark's own CDN — media host, CSP-only (never fetched directly).
  // Stored as a host pattern because CSP accepts wildcards that URLs can't
  // parse. Kept separate so `hostOf()` doesn't see a malformed URL.
  larkCDNHost: "*.larksuite.com",
} as const;

/** Extract the hostname from a service origin (for CSP, remotePatterns, etc.). */
export function hostOf(origin: string): string {
  return new URL(origin).hostname;
}
