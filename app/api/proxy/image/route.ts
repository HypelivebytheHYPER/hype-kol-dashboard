// Image proxy route - fetches external images and serves them with proper headers
// Handles CORS issues and sets correct Accept headers for image services

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Validate URL is from allowed domains
  const allowedDomains = [
    "unavatar.io",
    "pbs.twimg.com",
    "graph.facebook.com",
    "instagram.com",
    "i.ytimg.com",
    "yt3.ggpht.com",
  ];

  const urlObj = new URL(url);
  const isAllowed = allowedDomains.some(
    (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
  );

  if (!isAllowed) {
    return new Response("Domain not allowed", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Accept common image formats
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        // Forward user agent to avoid bot blocking
        "User-Agent":
          request.headers.get("user-agent") || "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
    });

    if (!response.ok) {
      console.error(`Image proxy error: ${response.status} for ${url}`);
      return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    // Get content type from upstream
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Create response with proper headers
    const proxyResponse = new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // Cache for 1 day, stale for 7 days
        "Access-Control-Allow-Origin": "*",
      },
    });

    return proxyResponse;
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Failed to proxy image", { status: 500 });
  }
}
