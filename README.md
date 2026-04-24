# Hype KOL Dashboard

Creator and Live Seller management dashboard for Hype marketing agency.

**Production**: https://hype-kol-dashboard.vercel.app

---

## Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16.2.1 + React 19 (App Router)          |
| Styling       | Tailwind CSS v4 + shadcn/ui components           |
| Data fetching | Server Components (ISR, TanStack Query hydration) |
| API backend   | Cloudflare Worker (`lark-http-hype`) -> Lark Base |
| Animations    | Framer Motion                                    |
| Charts        | Recharts                                         |

---

## Architecture

```
Server Components (ISR, revalidate=300s)
  -> POST /records/search  (list + filter)
  -> GET  /records/:app/:table/:id  (single record)
       -> lark-http-hype.hypelive.workers.dev (Cloudflare Worker)
            -> Lark Base (database)

App Router pages
  (dashboard) layout (sidebar + header)
    /                    Redirects to /kols
    /dashboard           Redirects to /dashboard/overview
    /dashboard/[type]    Analytics dashboard (overview/performance/gmv/engagement)
    /kols                Creator catalog + smart search
    /kols/[id]           Creator profile
    /live                Live MC Catalog with video preview
```

---

## Pages

| Route                  | Mode              | Description                                                      |
| ---------------------- | ----------------- | ---------------------------------------------------------------- |
| `/`                    | static (redirect) | Redirects to `/kols`                                             |
| `/dashboard`           | static (redirect) | Redirects to `/dashboard/overview`                               |
| `/dashboard/[type]`    | dynamic           | Analytics dashboard — KPI cards, charts, data table, CSV export  |
| `/kols`                | static, 300s ISR  | Creator catalog — smart search, filters, pagination              |
| `/kols/[id]`           | dynamic           | Creator profile — metrics, contact, recharts                     |
| `/live`                | static, 300s ISR  | Live MC Catalog — video preview with `#t=0.1` first-frame        |

---

## Data Flow

All data fetched server-side via two helpers in `lib/lark-base.ts`:

- `fetchRecords(tableId, opts)` → `POST /records/search` (list + filter)
- `fetchRecord(tableId, recordId, opts)` → `GET /records/:app/:table/:id` (single lookup)

| Table             | ID                  | Mapper                       |
| ----------------- | ------------------- | ---------------------------- |
| ALL_KOLS          | tblaijZshhnZLDWJ    | `recordToCreator()`          |
| LIVE_MC_LIST      | tblozhTWBHelXqRR    | `recordToLiveMC()`           |
| DASHBOARD_SUMMARY | tblOwkSqf5rci6zq    | `recordToDashboardMetric()`  |

Media URLs for video/image attachments are built via `buildMediaUrl(token, tableId)` →
`${WORKER}/api/image/${token}?tableId=${tableId}`.

### Dashboard Data Flow

The dashboard uses a pre-computed summary table (`DASHBOARD_SUMMARY`) for fast loading:

```
Lark Base (DASHBOARD_SUMMARY)
  ├─ loadDashboardMetrics(type, period?)     → KPI cards + Data table
  ├─ loadDashboardMetricsHistory(type)       → Chart trends (all periods)
  └─ loadDashboardPeriods()                  → Period selector dropdown
```

Metrics are computed from `ALL_KOLs` (1,400+ creators) and stored as one row per metric
per dashboard type per period. This avoids aggregating 1,400 rows on every page load.

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3900
pnpm build        # production build
```

---

## Project Structure

```
dashboard/
  app/
    (dashboard)/           All pages sharing sidebar layout
      layout.tsx           Sidebar + Header
      page.tsx             Root — redirects to /dashboard/overview
      kols/                Creator catalog + [kolId] profile
      live/                Live MC Catalog (video grid, wire-map)
    layout.tsx             Root layout (ThemeProvider)
    globals.css            Tailwind v4 theme + utilities
  components/
    ui/                    UI primitives (button, card, badge, chart, dialog, etc.)
    dashboard/             Dashboard components (kpi-cards, chart-section, data-table-section, shell)
    kol/                   KOLFeedCard (avatar + platform gradient)
    search/                CommandPalette (Cmd+K)
    layout/                Sidebar, header, mobile nav, theme toggle
  contexts/
    i18n-context.tsx       Internationalization context provider
    theme-provider.tsx     next-themes wrapper (default: dark)
  lib/
    lark-base.ts           fetchRecords + fetchAllRecords + buildMediaUrl
    record-mappers.ts      Record mappers (recordToCreator, recordToDashboardMetric, etc.)
    constants.ts           App constants (routes, dashboard types, radar ceilings)
    nav-items.ts           Navigation config (PRIMARY_NAV, MOBILE_BOTTOM_NAV)
    types/catalog.ts       Type definitions (Creator, LiveMC, DashboardMetric, ErrorProps)
    categories.ts          Standardized creator categories (26 entries)
    brand-categories.ts    Brand → content-category map (live MC page)
    smart-search.ts        Natural language search parser
    format.ts              formatNumber, formatCurrency, formatEngagement
    cn.ts                  Tailwind className utility
  i18n/                    i18n config (next-intl setup)
  locales/                 Translation files (en, th)
```

---

## Environment Variables

Set in Vercel project settings. Both are optional — the worker is open by default.

```
LARK_API_KEY               # Optional: only if the worker has API_KEY secret set
NEXT_PUBLIC_LARK_API_URL   # Optional: defaults to https://lark-http-hype.hypelive.workers.dev
```

---

## Design Tokens

Tailwind v4 `@theme inline` in `app/globals.css`. All colors as OKLCH, referenced via
semantic classes (`bg-muted`, `text-foreground`, `border-border`). Light + dark themes;
`ThemeProvider` defaults to dark.

Tokens defined in both themes: `background`, `foreground`, `card`, `popover`, `primary`,
`secondary`, `muted`, `accent`, `destructive` (+ `-foreground` for each), `border`,
`input`, `ring`, `chart-1..5`, `sidebar*`.

### Trend Colors

Dashboard trend indicators use semantic tokens (not raw Tailwind colors):

| Trend | Text | Background | Chart |
|-------|------|------------|-------|
| Up (positive) | `text-chart-2` | `bg-chart-2/10` | `hsl(var(--chart-2))` |
| Down (negative) | `text-destructive` | `bg-destructive/10` | `hsl(var(--destructive))` |
| Neutral | `text-muted-foreground` | `bg-muted` | `hsl(var(--chart-5))` |

**Always-dark media frames** — `/live` and `wire-map` use `bg-zinc-900/800/950` intentionally
for video card backgrounds, regardless of theme. Not a token bypass.
