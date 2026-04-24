import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle");

  if (!handle) {
    return Response.json({ error: "Missing handle" }, { status: 400 });
  }

  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
      `https://www.tiktok.com/@${handle}`
    )}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return Response.json(
        { error: `TikTok API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to fetch TikTok oEmbed" },
      { status: 500 }
    );
  }
}
