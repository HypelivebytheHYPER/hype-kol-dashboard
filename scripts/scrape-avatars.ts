import { chromium } from 'playwright';
import * as fs from 'fs';

async function loadHandles(): Promise<{ handle: string; record_id: string }[]> {
  const res = await fetch('https://lark-http-hype.hypelive.workers.dev/records/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_token: 'H2GQbZBFqaUW2usqPswlczYggWg',
      table_id: 'tbl5864QVOiEokTQ',
      page_size: 500,
      field_names: ['Handle', 'Record ID'],
    }),
  });
  const json = await res.json();
  const map = new Map<string, string>();
  for (const r of json.data || []) {
    const f = r.fields;
    const handle = Array.isArray(f.Handle) && f.Handle[0]?.text ? f.Handle[0].text : '';
    const recId = Array.isArray(f['Record ID']) && f['Record ID'][0]?.text ? f['Record ID'][0].text : r.record_id;
    if (handle && !map.has(handle.toLowerCase())) map.set(handle.toLowerCase(), recId);
  }
  return Array.from(map.entries()).map(([handle, record_id]) => ({ handle, record_id }));
}

async function scrapeAvatar(page: any, handle: string): Promise<string | null> {
  try {
    await page.goto(`https://www.tiktok.com/@${handle}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);
    const avatar = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const text = s.textContent || '';
        if (text.includes('avatarLarger')) {
          const match = text.match(/"avatarLarger":"([^"]+)"/);
          if (match) return match[1].replace(/\\u002F/g, '/');
        }
      }
      const og = document.querySelector('meta[property="og:image"]');
      if (og) {
        const content = (og as HTMLMetaElement).content;
        if (!content.includes('share_img')) return content;
      }
      return null;
    });
    return avatar;
  } catch {
    return null;
  }
}

(async () => {
  const creators = await loadHandles();
  console.log(`Found ${creators.length} unique handles`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const cache: Record<string, { record_id: string; avatar_url: string }> = {};

  for (let i = 0; i < creators.length; i++) {
    const c = creators[i];
    const url = await scrapeAvatar(page, c.handle);
    if (url) cache[c.handle.toLowerCase()] = { record_id: c.record_id, avatar_url: url };
    if ((i + 1) % 10 === 0) console.log(`Progress: ${i + 1}/${creators.length}`);
  }

  await browser.close();
  fs.writeFileSync('./scripts/avatar-scrape-result.json', JSON.stringify(cache, null, 2));
  console.log(`Done. Saved ${Object.keys(cache).length}/${creators.length} avatars`);
})();
