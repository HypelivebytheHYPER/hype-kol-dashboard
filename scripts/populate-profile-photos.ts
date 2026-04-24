/**
 * Populate Profile Photo URL field from scrape results + API fallback
 */

const LARK_API_KEY = process.env["LARK_API_KEY"] || process.env["LARK_MCP_API_KEY"]!;
const LARK_API_URL = "https://lark-http-hype.hypelive.workers.dev";
const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";
const TABLE_ID = "tblaijZshhnZLDWJ";

interface KOLRecord {
  record_id: string;
  handle: string;
  channel: string;
  hasPhoto: boolean;
}

async function fetchAllKOLs(): Promise<KOLRecord[]> {
  const all: KOLRecord[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 20; page++) {
    const res = await fetch(`${LARK_API_URL}/records/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LARK_API_KEY}`,
      },
      body: JSON.stringify({
        app_token: APP_TOKEN,
        table_id: TABLE_ID,
        page_size: 500,
        ...(pageToken && { page_token: pageToken }),
      }),
    });

    const json = (await res.json()) as {
      data?: Array<{ record_id: string; fields: Record<string, unknown> }>;
      has_more?: boolean;
      page_token?: string;
    };

    for (const r of json.data || []) {
      const f = r.fields;
      const channel =
        Array.isArray(f["Channel"]) && f["Channel"][0]?.link
          ? String(f["Channel"][0].link)
          : "";

      let handle = "";
      if (channel) {
        try {
          const url = new URL(channel);
          const match = url.pathname.match(/^\/@([^/]+)/);
          handle = match?.[1] ?? "";
        } catch {}
      }

      if (!handle) {
        const raw =
          Array.isArray(f["Handle"]) && f["Handle"][0]?.text
            ? String(f["Handle"][0].text)
            : "";
        handle = raw.trim();
      }

      const hasPhoto = !!f["Profile Photo URL"];

      if (handle) {
        all.push({ record_id: r.record_id, handle, channel, hasPhoto });
      }
    }

    if (!json.has_more || !json.page_token) break;
    pageToken = json.page_token;
  }

  return all;
}

async function fetchPhotoUrl(handle: string): Promise<string | null> {
  try {
    const url = `https://www.tiktok.com/@${handle}`;
    const res = await fetch(`https://hype-kol-dashboard.vercel.app/api/profile-photo?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json() as { photoUrl?: string };
    return data.photoUrl || null;
  } catch {
    return null;
  }
}

async function updateBatch(updates: { record_id: string; photoUrl: string }[]): Promise<void> {
  if (updates.length === 0) return;
  const res = await fetch(`${LARK_API_URL}/records/batch_update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LARK_API_KEY}`,
    },
    body: JSON.stringify({
      app_token: APP_TOKEN,
      table_id: TABLE_ID,
      records: updates.map((u) => ({
        record_id: u.record_id,
        fields: { "Profile Photo URL": u.photoUrl },
      })),
    }),
  });
  if (!res.ok) {
    console.error(`  Batch update failed: ${res.status}`);
  } else {
    console.log(`  Updated ${updates.length} records`);
  }
}

async function main() {
  console.log("=== Populate Profile Photo URLs ===\n");

  console.log("Fetching KOLs...");
  const kols = await fetchAllKOLs();
  console.log(`Total KOLs: ${kols.length}`);

  const needsPhoto = kols.filter(k => !k.hasPhoto && k.channel.includes("tiktok.com"));
  console.log(`Need photo (TikTok, no photo): ${needsPhoto.length}\n`);

  // Load previous results to skip known successes
  const fs = await import("fs");
  let previousResults: Record<string, string | null> = {};
  try {
    const raw = fs.readFileSync("./scripts/profile-photo-urls.json", "utf-8");
    const data = JSON.parse(raw);
    previousResults = data.urls || {};
    console.log(`Loaded ${Object.keys(previousResults).length} previous results`);
  } catch {
    console.log("No previous results found");
  }

  const results: Record<string, string | null> = { ...previousResults };
  const BATCH_SIZE = 20;
  const UPDATE_BATCH = 100;
  let pendingUpdates: { record_id: string; photoUrl: string }[] = [];

  for (let i = 0; i < needsPhoto.length; i++) {
    const kol = needsPhoto[i];
    const progress = `${i + 1}/${needsPhoto.length}`;

    if (results[kol.handle] !== undefined) {
      if (results[kol.handle]) {
        pendingUpdates.push({ record_id: kol.record_id, photoUrl: results[kol.handle]! });
      }
      process.stdout.write(`\r${progress} (cached) ${kol.handle} `);
    } else {
      const photoUrl = await fetchPhotoUrl(kol.handle);
      results[kol.handle] = photoUrl;
      if (photoUrl) {
        pendingUpdates.push({ record_id: kol.record_id, photoUrl });
        process.stdout.write(`\r${progress} ✅ ${kol.handle} `);
      } else {
        process.stdout.write(`\r${progress} ❌ ${kol.handle} `);
      }
    }

    // Flush updates periodically
    if (pendingUpdates.length >= UPDATE_BATCH) {
      await updateBatch(pendingUpdates);
      pendingUpdates = [];
    }

    // Save progress periodically
    if ((i + 1) % 100 === 0) {
      fs.writeFileSync("./scripts/profile-photo-urls.json", JSON.stringify({ urls: results }, null, 2));
    }
  }

  // Final flush
  if (pendingUpdates.length > 0) {
    await updateBatch(pendingUpdates);
  }

  // Save final results
  fs.writeFileSync("./scripts/profile-photo-urls.json", JSON.stringify({ urls: results }, null, 2));

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n\nDone! Total with photos: ${successCount}/${Object.keys(results).length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
