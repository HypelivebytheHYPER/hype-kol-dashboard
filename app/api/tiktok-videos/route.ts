import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export interface TikTokVideo {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  authorName?: string;
  html?: string;
}

/**
 * Extract video IDs from TikTok embed page HTML.
 * The embed page lists videos and contains URLs like /video/1234567890
 */
function extractVideoIds(html: string): string[] {
  const ids = new Set<string>();
  const regex = /video\/(\d{15,25})/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids).slice(0, 6); // Limit to 6 videos
}

async function fetchVideoOembed(videoUrl: string): Promise<{
  thumbnail?: string;
  title?: string;
  authorName?: string;
  html?: string;
} | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      thumbnail: data.thumbnail_url,
      title: data.title,
      authorName: data.author_name,
      html: data.html,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle");
  if (!handle) {
    return Response.json({ error: "Missing handle" }, { status: 400 });
  }

  try {
    const embedUrl = `https://www.tiktok.com/embed/@${handle}`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return Response.json(
        { error: `TikTok returned ${res.status}`, videos: [] },
        { status: 502 }
      );
    }

    const html = await res.text();
    const videoIds = extractVideoIds(html);

    if (videoIds.length === 0) {
      return Response.json({ videos: [] });
    }

    // Fetch oEmbed data for each video
    const videos: TikTokVideo[] = [];
    for (const id of videoIds) {
      const url = `https://www.tiktok.com/@${handle}/video/${id}`;
      const oembed = await fetchVideoOembed(url);
      videos.push({
        id,
        url,
        ...(oembed?.thumbnail ? { thumbnail: oembed.thumbnail } : {}),
        ...(oembed?.title ? { title: oembed.title } : {}),
        ...(oembed?.authorName ? { authorName: oembed.authorName } : {}),
        ...(oembed?.html ? { html: oembed.html } : {}),
      });
    }

    return Response.json(
      { videos },
      {
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch videos", videos: [] },
      { status: 500 }
    );
  }
}
