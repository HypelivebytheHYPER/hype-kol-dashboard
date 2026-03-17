// API route proxy to Lark HTTP Worker
// This keeps the LARK_API_KEY secure on the server side

import { env } from "@/lib/env";

const WORKER_BASE_URL =
  env.NEXT_PUBLIC_LARK_API_URL || "https://lark-http-hype.hypelive.workers.dev";

// Cache TTLs (s-maxage = Vercel CDN cache, stale-while-revalidate = serve stale while refreshing)
// This means: first visitor fetches from Lark (~2-4s), everyone after gets <100ms from Vercel edge
const CACHE_RULES: { pattern: RegExp; maxAge: number; swr: number }[] = [
  { pattern: /^\/api\/kols/, maxAge: 60, swr: 300 }, // 1min fresh, 5min stale
  { pattern: /^\/api\/live-sellers/, maxAge: 30, swr: 120 }, // 30s fresh, 2min stale
  { pattern: /^\/api\/campaigns/, maxAge: 60, swr: 300 },
  { pattern: /^\/api\/rate-cards/, maxAge: 120, swr: 600 },
  { pattern: /^\/api\/tier-rates/, maxAge: 300, swr: 900 },
  { pattern: /^\/api\/market-benchmarks/, maxAge: 300, swr: 900 },
  { pattern: /^\/api\/ooh-media/, maxAge: 120, swr: 600 },
  { pattern: /^\/api\/image\//, maxAge: 82800, swr: 3600 }, // 23h — Lark temp URLs
];

function getCacheHeader(path: string): string | null {
  const rule = CACHE_RULES.find((r) => r.pattern.test(path));
  if (!rule) return null;
  return `public, s-maxage=${rule.maxAge}, stale-while-revalidate=${rule.swr}`;
}

// Helper to create headers with API key
function createProxyHeaders(requestHeaders: Headers): Headers {
  const headers = new Headers();

  const contentType = requestHeaders.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  if (env.LARK_API_KEY) {
    headers.set("Authorization", `Bearer ${env.LARK_API_KEY}`);
  }

  return headers;
}

// Handle all HTTP methods
async function handleRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  const workerPath = "/" + path.join("/");
  const workerUrl = `${WORKER_BASE_URL}${workerPath}`;

  const headers = createProxyHeaders(request.headers);
  const body =
    request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;

  try {
    const workerResponse = await fetch(workerUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseHeaders = new Headers(workerResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");
    // Strip headers that block Vercel CDN caching
    responseHeaders.delete("set-cookie");
    responseHeaders.delete("vary"); // Vary:* or Vary:Authorization blocks edge cache

    // Inject Vercel edge cache header for GET 200 responses only
    // Note: browser requests carry NO Authorization header (proxy adds auth server-side)
    // so Vercel CDN will cache these as public responses
    if (request.method === "GET" && workerResponse.status === 200) {
      const cacheHeader = getCacheHeader(workerPath);
      if (cacheHeader) responseHeaders.set("Cache-Control", cacheHeader);
    }

    return new Response(workerResponse.body, {
      status: workerResponse.status,
      statusText: workerResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to API", code: 503 }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle CORS preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
