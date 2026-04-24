import { NextRequest } from "next/server";
import { fetchAvatarUrl } from "@/lib/profile-photo-server";

interface ProfilePhotoResult {
  photoUrl: string | null;
  platform: string | null;
  handle: string | null;
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

  try {
    const photoUrl = await fetchAvatarUrl(targetUrl);

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
