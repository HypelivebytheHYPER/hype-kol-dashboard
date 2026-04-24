/**
 * Sync scraped TikTok avatar URLs from `avatar-scrape-result.json` into
 * Lark Base `ALL_KOLS` table's "Avatar URL" field.
 *
 * Prerequisites:
 *   1. Add a text field named "Avatar URL" to the ALL_KOLS table in Lark Base.
 *   2. Set LARK_API_KEY in your environment (same key used by the app).
 *
 * Usage:
 *   npx tsx scripts/sync-avatars-to-lark.ts
 *
 * The script batches updates (50 records per request) to stay within
 * Lark API rate limits.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { updateRecords, TABLES } from "../lib/lark-base";

interface ScrapeResult {
  record_id: string;
  avatar_url: string;
}

const BATCH_SIZE = 50;
const SOURCE_FILE = join(process.cwd(), "scripts", "avatar-scrape-result.json");

async function main() {
  // Load scraped data
  const raw = readFileSync(SOURCE_FILE, "utf-8");
  const data = JSON.parse(raw) as Record<string, ScrapeResult>;

  const entries = Object.entries(data);
  console.log(`Loaded ${entries.length} avatar URLs from ${SOURCE_FILE}`);

  // Build update batches
  const batches: { record_id: string; fields: Record<string, string> }[][] = [];
  let currentBatch: { record_id: string; fields: Record<string, string> }[] = [];

  for (const [, { record_id, avatar_url }] of entries) {
    currentBatch.push({
      record_id,
      fields: { "Avatar URL": avatar_url },
    });

    if (currentBatch.length >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  console.log(`Prepared ${batches.length} batch(es) of max ${BATCH_SIZE} records`);

  // Push to Lark Base
  let totalUpdated = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`  Batch ${i + 1}/${batches.length}: ${batch.length} records...`);

    const result = await updateRecords(TABLES.ALL_KOLS, batch);

    if (result.success) {
      totalUpdated += result.updated ?? batch.length;
      console.log(`    ✓ Updated ${result.updated ?? batch.length}`);
    } else {
      console.error(`    ✗ Failed: ${result.error}`);
      process.exitCode = 1;
    }

    // Rate limit: 20 QPS for Lark Base
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log(`\nDone. ${totalUpdated}/${entries.length} records updated.`);
  console.log(`\nNext steps:`);
  console.log(`  1. Verify in Lark Base that "Avatar URL" field is populated.`);
  console.log(`  2. Remove lib/avatar-cache.json (no longer needed).`);
  console.log(`  3. Re-deploy the app.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
