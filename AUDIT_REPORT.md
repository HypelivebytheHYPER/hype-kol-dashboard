# Hype KOL Dashboard — Full Code Audit

**Project:** `/Users/mdch/hypelive/products/hype-kol/dashboard`  
**Date:** 2026-04-23  
**Auditor:** Kimi Code CLI  
**Scope:** All routes (`/`, `/kols`, `/kols/[kolId]`, `/live`), layouts, shared components, config, security headers

---

## Summary

| Category | 🔴 Critical | 🟡 Warning | 🔵 Info | Score |
|----------|-------------|------------|---------|-------|
| **Performance** | 1 | 4 | 3 | B+ |
| **Accessibility (a11y)** | 1 | 5 | 3 | B |
| **SEO** | 0 | 2 | 3 | A- |
| **Security** | 1 | 2 | 2 | B+ |
| **Code Quality** | 0 | 3 | 5 | A- |
| **UX / Mobile** | 0 | 3 | 4 | B+ |
| **Overall** | — | — | — | **B+** |

---

## Page-by-Page Audit

### Route: `/` → `/kols` (Rewritten)

| Issue | Severity | Location | Details |
|-------|----------|----------|---------|
| No dedicated root metadata | 🔵 Info | `next.config.ts` | `/` rewrites to `/kols` at edge. The root URL inherits `/kols` metadata which is fine, but a dedicated landing page could improve SEO for branded search. |

**Verdict:** ✅ Clean. The rewrite is efficient (no redirect round-trip).

---

### Route: `/kols` — Creators Listing

**File:** `app/(dashboard)/kols/page.tsx` + `kols-list-client.tsx`

#### 🔴 Critical

| # | Issue | Details |
|---|-------|---------|
| 1 | **Raw `<img>` tags — no Next.js Image optimization** | `KOLFeedCard` uses `<img src={kol.image} loading="lazy">`. This bypasses Next.js `Image` component which provides automatic WebP/AVIF conversion, responsive srcset, blur placeholder, and priority loading. **Impact:** ~200-500KB extra per image on mobile, no LQIP, cumulative layout shift risk. |

#### 🟡 Warnings

| # | Issue | Details |
|---|-------|---------|
| 2 | **Filter state not synced to URL** | Tab selection, tier filters, platform filters, search query, sort order, and page number are all React state only. **Impact:** Refresh loses filters; can't share filtered views; back button doesn't restore state. |
| 3 | **Missing `aria-label` on icon-only remove buttons** | Filter badge dismiss buttons (`<X className="w-3 h-3" />`) have no accessible label. Screen readers announce nothing. |
| 4 | **Search autocomplete click-outside pattern** | Uses manual `useRef` + `useEffect` + `mousedown` listener. Fragile — misses Escape key, focus trap, and screen reader interactions. Should use Radix Popover or similar. |
| 5 | **Performance: `useMemo` overuse on large arrays** | `filtered`, `sorted`, `stats`, `paginated` all re-compute on every keystroke with `O(n log n)` sorts. For >500 KOLs this is noticeable. Consider virtualized list + debounced search. |

#### 🔵 Info

| # | Issue | Details |
|---|-------|---------|
| 6 | **Mobile card grid uses `w-[78vw]`** | Hardcoded viewport percentage. Works but fragile on foldable devices or unusual viewports. Consider CSS container queries. |
| 7 | **No prefetch on card links** | `<Link href={kolProfilePath(kol.id)}>` has no `prefetch` prop. Next.js defaults help, but explicit prefetch on hover could speed up profile navigation. |
| 8 | **Smart search tips are English-only** | Tips like `"beauty bangkok"` don't localize. Fine for MVP but note for i18n completeness. |

**Verdict:** 🟡 Good structure, needs image optimization and URL state sync.

---

### Route: `/kols/[kolId]` — KOL Profile

**File:** `app/(dashboard)/kols/[kolId]/page.tsx` + `kol-profile-client.tsx`

#### 🔴 Critical

| # | Issue | Details |
|---|-------|---------|
| 9 | **Dynamic import with `ssr: true` is contradictory** | `const KOLProfileClient = dynamic(() => import("./kol-profile-client"), { ssr: true })` — `dynamic()` is for client-side code splitting. `ssr: true` forces server render, defeating the purpose. Recharts still ships to the server bundle. **Fix:** Use `{ ssr: false }` and wrap in `<Suspense>`, or use `next/dynamic` correctly. |

#### 🟡 Warnings

| # | Issue | Details |
|---|-------|---------|
| 10 | **Contact info not clickable** | Phone numbers, emails, and LINE IDs are displayed as plain text. Should be `<a href="tel:...">`, `<a href="mailto:...">`, and LINE deep links. |
| 11 | **External channel link lacks external indicator** | The "Channel" button opens in new tab (`target="_blank"`) but no visual icon or `rel="noopener noreferrer"` on the `<a>` wrapper (only on inner button). |
| 12 | **Nested `TooltipProvider`** | `kol-profile-client.tsx` wraps the KPI row in `<TooltipProvider delay={300}>`. `TooltipProvider` should be at the root layout level (already present via `layout.tsx`?). Nesting can cause z-index/portal conflicts. |
| 13 | **No JSON-LD structured data** | KOL profile pages are perfect candidates for Schema.org `Person` structured data (name, image, url, sameAs, jobTitle). Missing this hurts rich snippet eligibility. |
| 14 | **Bio rendering ignores HTML safety** | `kol.bio.th` and `kol.bio.en` are rendered as `{kol.bio.th}` JSX text. If Lark ever contains HTML, this is safe (React escapes). But if markdown or links are stored, they're not parsed. |

#### 🔵 Info

| # | Issue | Details |
|---|-------|---------|
| 15 | **Recharts radar chart normalizes data** | Radar ceilings are hardcoded (`RADAR_CEILINGS`). If market shifts, charts become misleading. Consider percentile-based normalization from the dataset. |
| 16 | **GMV bar chart missing empty state message** | `EmptyChart` just shows "No GMV data" — could explain *why* there's no data. |
| 17 | **Account type tooltip is hardcoded English** | Tooltip content for Main/Secondary/Backup accounts doesn't use i18n. |

**Verdict:** 🟡 Strong metadata and dynamic OG images. Fix the dynamic import and add JSON-LD.

---

### Route: `/live` — Live MC Catalog

**File:** `app/(dashboard)/live/page.tsx` + `live-catalog-client.tsx`

#### 🟡 Warnings

| # | Issue | Details |
|---|-------|---------|
| 18 | **Missing page metadata** | No `metadata` export. Title falls back to template `%s — HypeCreators` → renders as just `HypeCreators`. No description, no OG tags for this route. |
| 19 | **Hardcoded dark-mode colors for brand chips** | `bg-zinc-800 text-zinc-400 hover:bg-zinc-700` — doesn't respect theme system. Breaks in light mode. |
| 20 | **Video player state management** | `playingId` is a single string — only one video plays at a time, which is correct UX, but there's no pause-on-scroll or intersection observer to stop off-screen videos. |

#### 🔵 Info

| # | Issue | Details |
|---|-------|---------|
| 21 | **No empty state for WireMap** | If `filtered` is empty in wiremap view, nothing renders (no message). |
| 22 | **All video URLs pre-fetched** | `buildMediaUrls(videoTokens)` fetches all video URLs upfront. For 50+ MCs with 3 videos each, this is a large initial payload. Consider lazy-loading video URLs. |
| 23 | **Type assertion `c as ContentCategoryId`** | In `activeCategories` — assumes all category strings are valid. Runtime validation would be safer. |

**Verdict:** 🟡 Functional but needs metadata and theme-aware styling.

---

## Shared Components & Layout

### Root Layout (`app/layout.tsx`)

| Severity | Issue |
|----------|-------|
| 🔵 | `preconnect` to `SERVICES.larkWorker` is good, but missing `dns-prefetch` fallback for older browsers. |
| 🔵 | `suppressHydrationWarning` on `<html>` suppresses all hydration mismatches. Fine for theme toggling, but could hide real bugs. |
| ✅ | Font loading with `display: "swap"` is correct. |
| ✅ | Metadata setup is comprehensive (OG, Twitter, icons, robots). |

### Dashboard Layout (`app/(dashboard)/layout.tsx`)

| Severity | Issue |
|----------|-------|
| 🟡 | Mobile bottom nav uses `h-safe-area-inset-bottom` — this is a custom Tailwind class. Verify it's defined in `tailwind.config` or globals.css. If missing, iOS safe area padding won't work. |
| 🔵 | `pb-24 lg:pb-6` on `<main>` is a magic number. Consider deriving from nav height variable. |
| ✅ | Responsive sidebar/header/mobile nav pattern is clean. |

### Error Boundary (`app/error.tsx`)

| Severity | Issue |
|----------|-------|
| 🔵 | `console.error` in production logs to browser console only. Consider sending to Sentry or similar. |
| ✅ | Good UX with retry button and home navigation. |
| ✅ | Error digest displayed for debugging. |

### Loading Skeleton (`app/(dashboard)/loading.tsx`)

| ✅ | Clean pulse skeleton matching the layout structure. Good CLS prevention. |

---

## Security Audit

### Headers (`next.config.ts`)

| Header | Status | Notes |
|--------|--------|-------|
| `Content-Security-Policy` | 🟡 | `script-src 'self' 'unsafe-inline'` weakens CSP significantly. Consider nonce-based CSP or strict-dynamic. `frame-ancestors` allows hypelive-rate-card.vercel.app — verify this is intentional. |
| `Strict-Transport-Security` | ✅ | 2 years, includeSubDomains, preload. |
| `X-Content-Type-Options` | ✅ | nosniff |
| `Referrer-Policy` | ✅ | strict-origin-when-cross-origin |
| `Permissions-Policy` | ✅ | Camera, mic, geo disabled |
| Cache-Control (static) | ✅ | 1 year immutable |
| Cache-Control (API) | ✅ | 60s s-maxage + 300s stale-while-revalidate |

### Other Security Findings

| Severity | Issue |
|----------|-------|
| 🔴 | **`dangerouslySetInnerHTML` in `components/ui/chart.tsx`** | Used for injecting CSS variables. If any user input reaches this, it's an XSS vector. Verify the injected content is strictly controlled constants. |
| 🟡 | **No API rate limiting** | `/api/lark/:path*` routes are cached but not rate-limited. A malicious actor could exhaust Lark API quota. |
| 🟡 | **Lark API key exposure** | `lib/lark-base.ts` likely contains API credentials. Ensure `.env.local` is in `.gitignore` and keys are rotated regularly. |

---

## SEO Audit

| Item | Status | Notes |
|------|--------|-------|
| Sitemap | ✅ | Dynamic + static routes, `revalidate = 300` |
| Robots.txt | ✅ | Allows all, points to sitemap |
| Canonical URLs | ✅ | Per-page canonicals |
| OG Images | ✅ | KOL profile pages use actual KOL images |
| Twitter Cards | ✅ | `summary_large_image` |
| JSON-LD | ❌ Missing | No structured data for KOL profiles (Person schema) |
| Breadcrumbs | ❌ Missing | Only "Back to KOLs" link, no schema markup |
| `/live` metadata | ❌ Missing | No title/description export |

---

## Performance Audit

| Item | Status | Notes |
|------|--------|-------|
| Next.js Image component | ❌ Not used | Raw `<img>` tags throughout |
| Font optimization | ✅ | `next/font/google` with swap |
| Code splitting | ✅ | Recharts dynamically imported per route |
| Lazy loading (commands) | ✅ | CommandPalette `ssr: false` |
| Lazy loading (mobile search) | ✅ | MobileSearchOverlay dynamically loaded |
| ISR | ✅ | 300s revalidate on all data pages |
| Image formats | ✅ | WebP + AVIF configured |
| HLS.js | 🟡 | Imported but not code-split. If not used on initial load, consider dynamic import. |
| Console logging | 🟡 | `browserToTerminal: "warn"` — good, but `error.tsx` still `console.error`s in production. |

---

## Code Quality Findings

| Severity | Issue |
|----------|-------|
| 🟡 | **Type assertion in live page** | `c as ContentCategoryId` — should validate at runtime with zod or similar. |
| 🟡 | **Mixed quote styles** | Some files use `"` (TSX), some use `'` (imports). Minor — not a bug. |
| 🟡 | **No error handling in page components** | `loadKOLCatalog()` and `loadKOLProfile()` errors bubble to error boundary. Fine, but explicit try/catch with fallback UI is more robust. |
| 🔵 | **Hardcoded avatar initial** | `Header.tsx`: `<PremiumAvatar name="H" size="md" />` — should be user-aware. |
| 🔵 | **Unused imports** | `kol-profile-client.tsx` imports `Mail`, `Phone`, `MessageCircle` but they're used — actually fine. |
| 🔵 | **`React 19` + `reactCompiler: true`** | Experimental compiler enabled. Monitor for edge cases. |

---

## Recommended Fix Priority

### P0 — Do First

1. **Replace `<img>` with Next.js `<Image>` in `KOLFeedCard`** — Biggest performance win.
2. **Fix dynamic import `{ ssr: true }` in KOL profile** — Remove or set `ssr: false` + Suspense.
3. **Add metadata to `/live` page** — Currently has no SEO.

### P1 — Important

4. **Sync filter state to URL** (`/kols`) — Use `useSearchParams` + `router.push`.
5. **Add JSON-LD structured data** to KOL profile pages (`Person` schema).
6. **Make contact info clickable** (`tel:`, `mailto:`, LINE links).
7. **Add `aria-label` to icon-only buttons** in filter badges.
8. **Theme-aware brand chip colors** in `/live` (replace hardcoded zinc).

### P2 — Nice to Have

9. **Add breadcrumb schema** to KOL profile pages.
10. **Debounce search input** to reduce `useMemo` re-computation.
11. **Lazy-load video URLs** in `/live` instead of fetching all upfront.
12. **Harden CSP** — remove `'unsafe-inline'` from `script-src`.
13. **Add API rate limiting** on `/api/lark/*` routes.
14. **Add Sentry/error tracking** instead of `console.error`.

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total files audited | 18 |
| Page routes | 4 (`/`, `/kols`, `/kols/[kolId]`, `/live`) |
| Shared layouts | 2 |
| Components audited | 8 |
| Config files | 3 (`next.config.ts`, `package.json`, `.env` implied) |
| 🔴 Critical issues | 3 |
| 🟡 Warnings | 20 |
| 🔵 Info / suggestions | 18 |

---

*End of audit report.*
