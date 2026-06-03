// External service endpoints — single source of truth.
// One string per service. Callers that need just the host derive it with
// `hostOf()`; next.config.ts CSP + remotePatterns call it the same way.

export const SERVICES = {
  // Hypelive brand-asset bucket (Cloudflare R2, public).
  r2Brand: "https://pub-816814216dff403d8cc6955bb0ad1fec.r2.dev",

  // HypeStudio content bucket (Cloudflare R2, public).
  r2Studio: "https://pub-6b552d9c3c0f4ef0ba8e32adfb058578.r2.dev",
} as const;

/** Extract the hostname from a service origin (for CSP, remotePatterns, etc.). */
export function hostOf(origin: string): string {
  return new URL(origin).hostname;
}
