import { test, expect } from "@playwright/test";

const BASE = "https://hype-kol-dashboard.vercel.app";

/** Wait for KOL cards (at least 3 visible) */
async function waitForKOLCards(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => document.querySelectorAll('[class*="rounded-2xl"][class*="overflow-hidden"]').length >= 3,
    { timeout: 20000 }
  );
}

// ── T1: KOLs page loads ───────────────────────────────────────────────────────

test("T1: /kols page loads and shows KOL cards", async ({ page }) => {
  await page.goto(`${BASE}/kols`);

  // Sidebar nav — use the desktop sidebar specifically (hidden on mobile, visible on lg)
  await expect(page.locator("nav").first()).toBeVisible();

  // Page heading
  await expect(page.getByRole("heading", { name: /KOLs/i })).toBeVisible();

  // Wait for data — at least 3 KOL cards
  await waitForKOLCards(page);

  // Cards are visible
  const cards = page.locator('[class*="rounded-2xl"][class*="overflow-hidden"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
});

// ── T2: Settings page sidebar + normal heading ────────────────────────────────

test("T2: /settings page has sidebar and correct heading size", async ({ page }) => {
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState("networkidle");

  // Sidebar nav present (first nav = desktop sidebar)
  await expect(page.locator("nav").first()).toBeVisible();

  // Heading says "Settings"
  const heading = page.getByRole("heading", { name: "Settings" });
  await expect(heading).toBeVisible();

  // Font size should be <= 32px (not 48px text-display)
  const fontSize = await heading.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
  expect(fontSize).toBeLessThanOrEqual(32);
});

// ── T3: Dark mode metric text is light ───────────────────────────────────────

test("T3: Dark mode — metric values are light-colored, not black", async ({ page }) => {
  await page.goto(`${BASE}/kols`);
  await waitForKOLCards(page);

  // Toggle dark mode — find the theme toggle button by its Sun/Moon SVG in the header
  const htmlEl = page.locator("html");
  const isDark = (await htmlEl.getAttribute("class"))?.includes("dark");

  if (!isDark) {
    // Header theme toggle button — has both Sun and Moon icons
    const headerToggle = page
      .locator('[class*="Header"], header')
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();
    await headerToggle.click();
    await page.waitForTimeout(400);
  }

  await expect(htmlEl).toHaveClass(/dark/);

  // Check a metric value color — font-mono font-bold in a KOL card
  const metricVal = page
    .locator('[class*="rounded-2xl"][class*="overflow-hidden"]')
    .first()
    .locator('[class*="font-mono"][class*="font-bold"]')
    .first();

  await expect(metricVal).toBeVisible();

  const color = await metricVal.evaluate((el) => window.getComputedStyle(el).color);
  const rgb = color.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  const brightness = (rgb[0] + rgb[1] + rgb[2]) / 3;

  // In dark mode, text should be bright (> 150 out of 255, not pure black)
  expect(brightness).toBeGreaterThan(150);
});

// ── T4: Campaign banner shows when ?addTo= is in URL ─────────────────────────

test("T4: /kols?addTo=X shows campaign banner", async ({ page }) => {
  await page.goto(`${BASE}/kols?addTo=test-campaign-123`);
  await page.waitForLoadState("networkidle");

  // Banner text should appear
  await expect(page.locator("text=/Adding KOLs to/i")).toBeVisible({ timeout: 10000 });

  // Back button in banner
  await expect(page.locator("text=/Back/i").first()).toBeVisible();
});

// ── T5: KOL selection shows floating bar ─────────────────────────────────────

test("T5: Selecting a KOL shows floating selection bar", async ({ page }) => {
  await page.goto(`${BASE}/kols`);
  await waitForKOLCards(page);

  // Click the SelectionCheckbox (role=checkbox) on the first card
  const checkbox = page.locator('[role="checkbox"]').first();
  await checkbox.click();

  // Floating bar at bottom
  const floatingBar = page.locator(".fixed.bottom-6");
  await expect(floatingBar).toBeVisible({ timeout: 5000 });

  await expect(page.locator("text=/1 KOL selected/i")).toBeVisible();
  await expect(page.locator("text=/Add to Campaign/i").first()).toBeVisible();
});

// ── T6: Campaigns page loads ──────────────────────────────────────────────────

test("T6: /campaigns page loads with heading and new-campaign button", async ({ page }) => {
  await page.goto(`${BASE}/campaigns`);
  await page.waitForLoadState("networkidle");

  // Sidebar nav (first = desktop sidebar)
  await expect(page.locator("nav").first()).toBeVisible();

  // Heading
  await expect(page.getByRole("heading", { name: /Campaigns/i })).toBeVisible();

  // New Campaign button
  await expect(page.locator("text=/New Campaign/i")).toBeVisible();
});

// ── T7: /api/lark/api/kols returns JSON with data ────────────────────────────

test("T7: /api/lark/api/kols returns 200 with KOL data array", async ({ request }) => {
  const response = await request.get(`${BASE}/api/lark/api/kols`);

  expect(response.status()).toBe(200);

  // Content-type should be JSON
  const contentType = response.headers()["content-type"];
  expect(contentType).toMatch(/json/);

  const body = await response.json();
  expect(body).toHaveProperty("data");
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);

  // Cache-Control should be set (either public or s-maxage — Vercel may rewrite)
  const cacheControl = response.headers()["cache-control"];
  expect(cacheControl).toBeTruthy();
});

// ── T8: Image proxy responds without server error ────────────────────────────

test("T8: KOL image proxy responds without 5xx error", async ({ request }) => {
  // Get a KOL with a computedImageUrl
  const kolsResp = await request.get(`${BASE}/api/lark/api/kols`);
  const kols = await kolsResp.json();

  const kolWithImage = kols.data?.find((k: { computedImageUrl?: string }) => k.computedImageUrl);

  if (!kolWithImage) {
    test.skip();
    return;
  }

  // Transform /api/image/TOKEN → /api/lark/api/image/TOKEN/redirect
  const token = kolWithImage.computedImageUrl.replace("/api/image/", "");
  const imageUrl = `${BASE}/api/lark/api/image/${token}/redirect`;

  const imgResp = await request.get(imageUrl, { maxRedirects: 0 });

  // Should not be a server error (5xx)
  // 200 = direct image, 302 = redirect to Lark CDN, 404 = token expired (acceptable)
  expect(imgResp.status()).toBeLessThan(500);
});
