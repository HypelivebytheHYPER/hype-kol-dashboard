import { unstable_cache } from "next/cache";

function extractTikTokPhoto(html: string): string | null {
  const avtMatch = html.match(
    /(https?:\/\/[^"'<>\s]+tiktokcdn[^"'<>\s]*\/[^"'<>\s]*avt[^"'<>\s]*)/i
  );
  if (avtMatch) {
    const url = avtMatch[1]!.replace(/&amp;/g, "&");
    return url.replace(/~tplv-tiktokx-cropcenter:\d+:\d+/, "~tplv-tiktokx-cropcenter:1080:1080");
  }
  const avatarMatch = html.match(/"avatarLarger"\s*:\s*"([^"]+)"/);
  if (avatarMatch) {
    return avatarMatch[1]!.replace(/\\u002F/g, "/");
  }
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

function extractInstagramPhoto(html: string): string | null {
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogMatch) {
    const url = ogMatch[1]!;
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

/** Cached server-side avatar fetch — scrapes TikTok/IG embed pages.
 *  Cached for 24h via unstable_cache. */
export const fetchAvatarUrl = unstable_cache(
  async (profileUrl: string): Promise<string | null> => {
    const detected = detectPlatform(profileUrl);

    const fetchUrl =
      detected.platform === "tiktok" && detected.handle
        ? `https://www.tiktok.com/embed/@${detected.handle}?lang=th-TH`
        : profileUrl;

    try {
      const res = await fetch(fetchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
          Referer: "https://www.tiktok.com/",
        },
      });

      if (!res.ok) return null;
      const html = await res.text();

      if (detected.platform === "tiktok") {
        return extractTikTokPhoto(html);
      } else if (detected.platform === "instagram") {
        return extractInstagramPhoto(html);
      } else {
        const ogMatch = html.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        );
        return ogMatch?.[1] ?? null;
      }
    } catch {
      return null;
    }
  },
  ["avatar-url"],
  { revalidate: 86400 }
);

/** Batch fetch avatar URLs for multiple creators.
 *  Uses Promise.all with concurrency limit. */
export async function batchFetchAvatars(
  entries: { key: string; profileUrl: string }[],
  concurrency = 8
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async ({ key, profileUrl }) => {
        const url = await fetchAvatarUrl(profileUrl);
        return { key, url };
      })
    );
    for (const { key, url } of batchResults) {
      results.set(key, url);
    }
  }

  return results;
}
