# Hype KOL Dashboard

KOL (Key Opinion Leader) and Live Seller management dashboard for Hype marketing agency.

**Production**: https://hype-kol-dashboard.vercel.app

---

## Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16.1.6 + React 19 (App Router)             |
| Styling       | Tailwind CSS v4 + shadcn/ui                        |
| Data fetching | TanStack Query v5                                  |
| API backend   | Cloudflare Worker (`lark-http-hype`) → Lark Base   |
| API proxy     | Vercel route `/api/lark/[...path]` with edge cache |
| Animations    | Framer Motion                                      |
| Charts        | Recharts                                           |
| E2E tests     | Playwright                                         |

---

## Architecture

```
Browser
  └── Next.js on Vercel
        ├── /api/lark/[...path]   ← proxy with edge cache (s-maxage)
        └── App Router pages
              └── (dashboard) layout (sidebar + header)
                    ├── / ............. Command Center
                    ├── /kols ......... KOL catalog + smart search
                    ├── /kols/[id] .... KOL profile
                    ├── /live ......... Live Seller monitor
                    ├── /campaigns .... Campaign list
                    ├── /campaigns/new  New campaign form
                    ├── /campaigns/[id] Campaign detail + KOL grid
                    ├── /discover ..... Tinder-style KOL swipe finder
                    ├── /ooh .......... OOH Media table
                    └── /settings ..... Account settings

Vercel /api/lark proxy
  └── lark-http-hype.hypelive.workers.dev  (Cloudflare Worker)
        └── Lark Base REST API (database)
```

---

## Pages

| Route             | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `/`               | Command Center — stats, trending KOLs, active campaigns            |
| `/kols`           | KOL catalog — smart search, tier/platform/type filters, pagination |
| `/kols/[id]`      | KOL profile — metrics, contact, campaign history                   |
| `/live`           | Live Seller monitor — real-time GMV, live status                   |
| `/campaigns`      | Campaign list — smart collections, KOL avatar previews             |
| `/campaigns/new`  | New campaign form                                                  |
| `/campaigns/[id]` | Campaign detail — KOL grid (same as /kols), remove/add KOLs        |
| `/discover`       | Tinder-style KOL swipe finder — card-by-card discovery             |
| `/ooh`            | OOH Media — outdoor advertising inventory table                    |
| `/settings`       | Account settings — profile, notifications, API config              |

---

## Key Features

### Smart Search

Type natural language on `/kols` — e.g. `beauty micro bangkok`, `>100k followers live`, `>5% engagement`. Parses tier, platform, location, follower threshold, engagement rate from free text.

### KOL Selection → Campaign Flow

1. Select KOLs with checkboxes on `/kols` → floating bar appears
2. Click "Add to Campaign" → dialog shows active campaigns
3. Assign to existing campaign or create new one → saves to Lark Base
4. **From campaign detail**: "Add KOLs" navigates to `/kols?addTo=ID` — banner appears, dialog pre-selects the campaign, auto-navigates back after adding

### Edge Cache

`/api/lark/[...path]` sets `Cache-Control: s-maxage` + `stale-while-revalidate` headers so Vercel CDN serves cached responses in ~370ms (vs 3s+ cold). KOL list: 60s fresh / 300s stale. Images: 23hr cache.

### Dark Mode

Full dark mode via `next-themes`. Uses `@custom-variant dark (&:is(.dark, .dark *))` to fix Tailwind v4 CSS variable opacity issue.

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3900
pnpm build        # production build
pnpm test:e2e     # run Playwright e2e tests (headless)
pnpm test:e2e:ui  # Playwright UI mode (visual)
```

---

## Project Structure

```
dashboard/
├── app/
│   ├── (dashboard)/         # All pages sharing sidebar layout
│   │   ├── layout.tsx       # Sidebar + Header + SelectionProvider
│   │   ├── page.tsx         # Command Center
│   │   ├── kols/            # KOL catalog + [id] profile
│   │   ├── live/            # Live Seller monitor
│   │   ├── campaigns/       # Campaign list + [campaignId] detail
│   │   ├── ooh/             # OOH Media table
│   │   ├── discover/        # Discovery (filter-heavy view)
│   │   └── settings/        # Account settings
│   ├── api/
│   │   └── lark/[...path]/  # Vercel proxy → CF Worker (with edge cache)
│   ├── layout.tsx           # Root layout (QueryProvider, ThemeProvider)
│   └── globals.css          # Tailwind v4 theme variables + typography
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── kol/                 # KOLFeedCard, KOLContactEditor, ScoreGauge
│   ├── selection/           # FloatingSelectionBar, AddToCampaignDialog
│   ├── search/              # CommandPalette (Cmd+K)
│   ├── sidebar.tsx          # Desktop sidebar nav
│   ├── mobile-sidebar.tsx   # Mobile header + drawer nav
│   └── header.tsx           # Desktop header (search, theme, notifications)
├── hooks/
│   ├── use-kols.ts          # useKOLs, useLiveSellers (TanStack Query)
│   └── use-campaigns.ts     # useCampaigns, useCreateCampaign, useUpdateCampaign
├── lib/
│   ├── lark-api.ts          # API types + getKOLImageUrl()
│   ├── selection-context.tsx # Global KOL selection state (targetCampaignId)
│   ├── smart-search.ts      # Natural language search parser
│   ├── config/
│   │   ├── campaigns.ts     # Campaign status config
│   │   └── tiers.ts         # Tier base rates
│   └── utils.ts             # formatNumber, formatCurrency, getTierColor
├── e2e/
│   └── dashboard.spec.ts    # Playwright e2e tests (8 tests, ~10s)
└── playwright.config.ts     # Playwright config → production URL
```

---

## API Proxy

All data goes through `/api/lark/[...path]/route.ts` which:

- Adds `Authorization: Bearer` header server-side (never exposed to browser)
- Sets edge cache headers per route pattern
- Strips `Vary`, `Set-Cookie`, `content-encoding` to allow CDN caching

| Endpoint            | Cache                       |
| ------------------- | --------------------------- |
| `/api/kols`         | 60s fresh, 300s stale       |
| `/api/live-sellers` | 30s fresh, 120s stale       |
| `/api/image/*`      | 23hr fresh, 1hr stale       |
| `/api/campaigns*`   | no cache (mutations)        |

---

## Environment Variables

Set in Vercel project settings (not committed):

```
LARK_API_KEY=<key>        # Lark Base API key — set as Vercel env var
```

The CF Worker URL is hardcoded in `/api/lark/[...path]/route.ts`.

---

## E2E Tests

8 tests against production (`https://hype-kol-dashboard.vercel.app`):

| Test | What it checks                                |
| ---- | --------------------------------------------- |
| T1   | /kols loads with ≥3 KOL cards                 |
| T2   | /settings has sidebar, heading ≤32px          |
| T3   | Dark mode metric text is bright (not black)   |
| T4   | /kols?addTo=X shows "Adding KOLs to" banner   |
| T5   | KOL checkbox → floating selection bar appears |
| T6   | /campaigns loads with New Campaign button     |
| T7   | /api/lark/api/kols → 200 JSON with data array |
| T8   | KOL image redirect responds without 5xx       |

```bash
pnpm test:e2e
# 8 passed (~10s)
```
