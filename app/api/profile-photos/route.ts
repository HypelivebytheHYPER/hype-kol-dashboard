import { NextRequest } from "next/server";
import { fetchAvatarUrl } from "@/lib/profile-photo-server";

interface BatchRequest {
  items: { id: string; url: string }[];
}

interface BatchResponse {
  photos: Record<string, string | null>;
}

export async function POST(request: NextRequest) {
  let body: BatchRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Expected items array" }, { status: 400 });
  }

  // Limit batch size to prevent abuse
  const limited = items.slice(0, 48);

  const results: Record<string, string | null> = {};

  // Fetch avatars concurrently (each is cached via unstable_cache)
  await Promise.all(
    limited.map(async ({ id, url }) => {
      try {
        const photoUrl = await fetchAvatarUrl(url);
        results[id] = photoUrl;
      } catch {
        results[id] = null;
      }
    })
  );

  const response: BatchResponse = { photos: results };

  return Response.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
