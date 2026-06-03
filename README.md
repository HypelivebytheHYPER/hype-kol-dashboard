# Hype KOL Dashboard

Creator and Live Seller management dashboard for Hype marketing agency.

**Production**: https://hype-kol-dashboard.vercel.app

---

## Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16.2.4 + React 19 (App Router)          |
| Styling       | Tailwind CSS v4 + shadcn/ui components           |
| Data fetching | Server Components (ISR, `unstable_cache`)        |
| API backend   | lark-cli subprocess → Lark Base                  |
| Animations    | Framer Motion                                    |
| Charts        | Recharts                                         |

---

## Architecture

```
Server Components (ISR, revalidate=300s)
  -> lark-cli base +record-list --view-id --field-id --filter-json --sort-json
  -> lark-cli base +record-get --record-id
  -> lark-cli base +table-get (schema cache)
       -> Lark Base (database)

App Router pages
  (dashboard) layout (sidebar + header)
    /                    Redirects to /kols
    /dashboard           Redirects to /dashboard/overview
    /dashboard/[type]    Analytics dashboard (overview/performance/gmv/engagement)
    /kols                Creator catalog + smart search
    /kols/[id]           Creator profile
    /live                Live MC Catalog with video preview
    /hypestudio          Studio/venue listings
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
| `/hypestudio`          | static, 300s ISR  | Studio/venue listings with photos                                |

---

## Data Flow

All data fetched server-side via `lib/lark-cli-bridge.ts`:

| Function | Purpose |
|----------|---------|
| `fetchRecords(tableId, opts)` | Paginated list with view/filter/projection |
| `fetchAllRecords(tableId, opts)` | Auto-paginated full list |
| `filterRecords(tableId, opts)` | **Dynamic** server-side filter + sort |
| `filterAllRecords(tableId, opts)` | Auto-paginated filter + sort |
| `searchRecords(tableId, keyword, opts)` | Keyword search |
| `getRecordsById(tableId, recordIds, opts)` | Batch record lookup |
| `getTableSchema(tableId)` | Schema cache (fields + types) |

| Table             | ID                  | Mapper                       |
| ----------------- | ------------------- | ---------------------------- |
| ALL_KOLS          | tbl5864QVOiEokTQ    | `recordToCreator()`          |
| KOL_LIVE_SELLER   | tblaijZshhnZLDWJ    | (extended creator data)      |
| LIVE_MC_LIST      | tblozhTWBHelXqRR    | `recordToLiveMC()`           |
| DASHBOARD_SUMMARY | tblOwkSqf5rci6zq    | `recordToDashboardMetric()`  |
| STUDIO_LIST       | tblKvYwcJY7Yxa20    | `recordToStudio()`           |
| MC_REQUESTS       | tbl6wOMD7TDJdWJV    | (MC booking requests)        |

### View Registry

Lark Base views provide **server-side filtering**. Use these instead of client-side filtering:

| View ID | Name | Filter | Use Case |
|---------|------|--------|----------|
| `vewfxCsqZ6` | Kols Management | None | Full catalog |
| `vewC4ioP6S` | TikTok with Photos | Attachment ≠ empty | KOLs with profile images |
| `vewwrNWBJD` | Creator KOLs | VideoGmv > 0 | Creator KOLs only |
| `vewB7z2HDR` | Live Seller KOLs | LiveGmv > 0 | Live seller KOLs only |
| `vewL4Gwm2Q` | Live Creator KOLs | LiveGmv > 0 AND VideoGmv > 0 | Hybrid KOLs |
| `vewmNIShjx` | Macro KOL Creators | VideoGmv > 0 AND Follower ≥ 100k | Macro creators |

### Dashboard Data Flow

Dashboard data comes from `DASHBOARD_SUMMARY` (pre-computed KPIs):

```
Lark Base (DASHBOARD_SUMMARY)
  ├─ getDashboardKPIs(type, period?)       → KPI cards + Data table
  ├─ loadDashboardMetricsHistory(type)     → Chart trends (all periods)
  └─ loadDashboardPeriods()                → Period selector dropdown
```

> ⚠️ **Dashboard blocks are broken** — they reference deleted fields and return 4400 errors. All dashboard data now comes from `DASHBOARD_SUMMARY` table directly.

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
      hypestudio/          Studio/venue listings
    layout.tsx             Root layout (ThemeProvider)
    globals.css            Tailwind v4 theme + utilities
  components/
    ui/                    UI primitives (button, card, badge, chart, dialog, etc.)
    dashboard/             Dashboard components (kpi-cards, chart-section, data-table-section, shell)
    kol/                   KOLFeedCard (avatar + platform gradient)
    search/                CommandPalette (Cmd+K)
    layout/                Sidebar, header, mobile nav, theme toggle
  lib/
    lark-cli-bridge.ts     Lark CLI data layer (fetch, filter, search, schema, aggregates)
    record-mappers.ts      Record mappers (recordToCreator, recordToDashboardMetric, etc.)
    design-tokens.ts       Semantic Tailwind class tokens
    taxonomy.ts            Content categories + platform maps
    constants.ts           App constants (routes, dashboard types, radar ceilings)
    nav-items.ts           Navigation config (PRIMARY_NAV, MOBILE_BOTTOM_NAV)
    types.ts               Type definitions (Creator, LiveMC, DashboardMetric, Studio)
    format.ts              formatNumber, formatCurrency, formatEngagement
    cn.ts                  Tailwind className utility
  i18n/                    i18n config (next-intl setup)
  locales/                 Translation files (en, th)
```

---

## Environment Variables

```bash
LARK_BASE_TOKEN="H2GQbZBFqaUW2usqPswlczYggWg"  # Base token for lark-cli
LARK_APP_ID="cli_a8a819818eb9d029"               # Lark app ID
LARK_APP_SECRET="xxx"                             # Lark app secret
LARK_DASHBOARD_ID="blkEow75KKNcxFRE"             # Dashboard ID (deprecated, blocks broken)
```

---

## Design Tokens

Tailwind v4 `@theme inline` in `app/globals.css`. All colors as OKLCH, referenced via semantic classes (`bg-muted`, `text-foreground`, `border-border`). Light + dark themes; `ThemeProvider` defaults to dark.

Tokens defined in both themes: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` (+ `-foreground` for each), `border`, `input`, `ring`, `chart-1..5`, `sidebar*`.

### Trend Colors

| Trend | Text | Background | Chart |
|-------|------|------------|-------|
| Up (positive) | `text-chart-2` | `bg-chart-2/10` | `hsl(var(--chart-2))` |
| Down (negative) | `text-destructive` | `bg-destructive/10` | `hsl(var(--destructive))` |
| Neutral | `text-muted-foreground` | `bg-muted` | `hsl(var(--chart-5))` |

**Always-dark media frames** — `/live` and `wire-map` use `bg-zinc-900/800/950` intentionally for video card backgrounds, regardless of theme. Not a token bypass.
