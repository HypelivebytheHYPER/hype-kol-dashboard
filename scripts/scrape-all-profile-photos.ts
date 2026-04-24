/**
 * FAST batch scraper — reuses a single Playwright page to avoid overhead.
 * Processes ~20 KOLs/minute vs ~10/minute with page-per-scrape.
 */

import { chromium } from "playwright-core";

const LARK_API_KEY = process.env["LARK_API_KEY"]!;
const LARK_API_URL = "https://lark-http-hype.hypelive.workers.dev";
const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";
const TABLE_ID = "tblaijZshhnZLDWJ";

interface KOLRecord {
  record_id: string;
  handle: string;
}

/* ── Fetch all KOLs ───────────────────────────────────────────────── */

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

      if (handle && /^[a-zA-Z0-9_.]+$/.test(handle) && handle.length <= 24) {
        all.push({ record_id: r.record_id, handle });
      }
    }

    if (!json.has_more || !json.page_token) break;
    pageToken = json.page_token;
  }

  return all;
}

/* ── Scrape with single reused page ───────────────────────────────── */

async function scrapeWithPage(
  page: import("playwright-core").Page,
  handle: string
): Promise<string | null> {
  try {
    await page.goto(`https://www.tiktok.com/embed/@${handle}?lang=th-TH`, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    await page.waitForTimeout(1200);

    const photoUrl = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const avtMatch = html.match(
        /(https?:\/\/[^"'<>\s]+tiktokcdn[^"'<>\s]*\/[^"'<>\s]*avt[^"'<>\s]*)/i
      );
      if (avtMatch) {
        return avtMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/~tplv-tiktokx-cropcenter:\d+:\d+/, "~tplv-tiktokx-cropcenter:1080:1080");
      }
      const scriptMatch = html.match(/"avatarLarger":"([^"]+)"/);
      if (scriptMatch) {
        return scriptMatch[1].replace(/\\u002F/g, "/");
      }
      return null;
    });

    return photoUrl;
  } catch {
    return null;
  }
}

/* ── Batch update Lark Base ───────────────────────────────────────── */

async function updateLarkBase(
  updates: { record_id: string; photoUrl: string }[]
): Promise<void> {
  if (updates.length === 0) return;

  const BATCH_SIZE = 500;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${LARK_API_URL}/records/batch_update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LARK_API_KEY}`,
      },
      body: JSON.stringify({
        app_token: APP_TOKEN,
        table_id: TABLE_ID,
        records: batch.map((u) => ({
          record_id: u.record_id,
          fields: { "Profile Photo URL": u.photoUrl },
        })),
      }),
    });

    if (!res.ok) {
      console.error(`  Batch update failed: ${res.status}`);
    } else {
      console.log(`  Updated ${batch.length} records`);
    }
  }
}

/* ── Main ─────────────────────────────────────────────────────────── */

async function main() {
  console.log("=== Fast Profile Photo Scraper ===\n");

  console.log("Fetching KOLs...");
  const kols = await fetchAllKOLs();
  console.log(`Total to scrape: ${kols.length}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results: { record_id: string; handle: string; photoUrl: string | null }[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < kols.length; i += BATCH_SIZE) {
    const batch = kols.slice(i, i + BATCH_SIZE);
    const progress = `${i + 1}-${Math.min(i + BATCH_SIZE, kols.length)}/${kols.length}`;
    process.stdout.write(`\r${progress} `);

    for (const kol of batch) {
      const photoUrl = await scrapeWithPage(page, kol.handle);
      results.push({ record_id: kol.record_id, handle: kol.handle, photoUrl });
      process.stdout.write(photoUrl ? "✅" : "❌");
    }
  }

  await page.close();
  await browser.close();

  const successCount = results.filter((r) => r.photoUrl).length;
  console.log(`\n\nSuccess: ${successCount}/${results.length}`);

  // Update Lark Base
  const withPhotos = results.filter((r): r is typeof r & { photoUrl: string } => !!r.photoUrl);
  console.log("\nUpdating Lark Base...");
  await updateLarkBase(withPhotos);

  // Save results
  const fs = await import("fs");
  fs.writeFileSync(
    "./scripts/profile-photo-results.json",
    JSON.stringify(
      {
        total: kols.length,
        success: successCount,
        failed: results.length - successCount,
        results: results.map((r) => ({
          handle: r.handle,
          status: r.photoUrl ? "success" : "failed",
        })),
      },
      null,
      2
    )
  );

  console.log("Done! Saved to scripts/profile-photo-results.json");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
