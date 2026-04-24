import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface ProfilePhotoResult {
  photoUrl: string | null;
  platform: string | null;
  handle: string | null;
}

/** Extract profile photo URL from TikTok embed HTML.
 *  Uses the /embed/@handle endpoint which bypasses WAF and includes avatar in HTML.
 */
function extractTikTokPhoto(html: string): string | null {
  // Strategy 1: avatar image src in embed HTML (most reliable)
  // Pattern: https://...tiktokcdn.../...avt.../~tplv-tiktokx-cropcenter:100:100.jpeg
  const avtMatch = html.match(
    /(https?:\/\/[^"'<>\s]+tiktokcdn[^"'<>\s]*\/[^"'<>\s]*avt[^"'<>\s]*)/i
  );
  if (avtMatch) {
    const url = avtMatch[1]!.replace(/&amp;/g, "&");
    // Get higher-res version by replacing 100:100 with 1080:1080
    return url.replace(/~tplv-tiktokx-cropcenter:\d+:\d+/, "~tplv-tiktokx-cropcenter:1080:1080");
  }

  // Strategy 2: avatarLarger in JSON inside script tags
  const avatarMatch = html.match(/"avatarLarger"\s*:\s*"([^"]+)"/);
  if (avatarMatch) {
    return avatarMatch[1]!.replace(/\\u002F/g, "/");
  }

  // Strategy 3: Open Graph image meta tag
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogMatch) {
    const url = ogMatch[1]!;
    if (!url.includes("share_img") && !url.includes("default-avatar")) {
      return url.replace(/\\u002F/g, "/");
    }
  }

  return null;
}

/** Extract profile photo URL from Instagram HTML.
 *  Instagram is heavily bot-protected, but og:image sometimes works.
 */
function extractInstagramPhoto(html: string): string | null {
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogMatch) {
    const url = ogMatch[1]!;
    // Skip generic Instagram assets
    if (!url.includes("instagram.com/static/")) return url;
  }
  return null;
}

function detectPlatform(profileUrl: string): { platform: string; handle: string | null } {
  try {
    const url = new URL(profileUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("tiktok.com")) {
      const match = url.pathname.match(/^\/@([^/]+)/);
      return { platform: "tiktok", handle: match?.[1] ?? null };
    }
    if (host.includes("instagram.com")) {
      const match = url.pathname.match(/^\/([^/]+)/);
      return { platform: "instagram", handle: match?.[1] ?? null };
    }
    return { platform: host.split(".")[0] ?? "unknown", handle: null };
  } catch {
    return { platform: "unknown", handle: null };
  }
}

export async function GET(request: NextRequest) {
  const profileUrl = request.nextUrl.searchParams.get("url");
  const handle = request.nextUrl.searchParams.get("handle");
  const platform = request.nextUrl.searchParams.get("platform");

  // Build URL from handle + platform if direct URL not provided
  let targetUrl = profileUrl;
  if (!targetUrl && handle) {
    const p = (platform || "tiktok").toLowerCase();
    if (p === "tiktok") targetUrl = `https://www.tiktok.com/@${handle}`;
    else if (p === "instagram") targetUrl = `https://www.instagram.com/${handle}/`;
  }

  if (!targetUrl) {
    return Response.json(
      { error: "Provide either ?url= or ?handle= (+ optional ?platform=)" },
      { status: 400 }
    );
  }

  const detected = detectPlatform(targetUrl);
  const cacheKey = `profile-photo-${detected.platform}-${detected.handle || targetUrl}`;

  try {
      // For TikTok, use the embed endpoint which bypasses WAF
    const fetchUrl =
      detected.platform === "tiktok" && detected.handle
        ? `https://www.tiktok.com/embed/@${detected.handle}?lang=th-TH`
        : targetUrl;

    // Fetch with a realistic browser UA to avoid blocks
    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.tiktok.com/",
      },
      next: { revalidate: 86400, tags: [cacheKey] }, // Cache 24 hours
    });

    if (!res.ok) {
      return Response.json(
        { error: `Platform returned ${res.status}`, photoUrl: null },
        { status: 502 }
      );
    }

    const html = await res.text();

    let photoUrl: string | null = null;
    if (detected.platform === "tiktok") {
      photoUrl = extractTikTokPhoto(html);
    } else if (detected.platform === "instagram") {
      photoUrl = extractInstagramPhoto(html);
    } else {
      // Generic OG image fallback
      const ogMatch = html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      );
      photoUrl = ogMatch?.[1] ?? null;
    }

    const result: ProfilePhotoResult = {
      photoUrl,
      platform: detected.platform,
      handle: detected.handle,
    };

    return Response.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Fetch failed",
        photoUrl: null,
      },
      { status: 500 }
    );
  }
}
