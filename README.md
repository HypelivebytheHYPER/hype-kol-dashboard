# Hype KOL Dashboard

Creator and Live Seller management dashboard for Hype marketing agency.

**Production**: https://hype-kol-dashboard.vercel.app

---

## Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16.2.1 + React 19 (App Router)          |
| Styling       | Tailwind CSS v4 + shadcn/ui components           |
| Data fetching | Server Components + POST /records/search (ISR)   |
| API backend   | Cloudflare Worker (`lark-http-hype`) -> Lark Base |
| Animations    | Framer Motion                                    |
| Charts        | Recharts                                         |

---

## Architecture

```
Server Components (ISR, revalidate=300s)
  -> POST /records/search
       -> lark-http-hype.hypelive.workers.dev (Cloudflare Worker)
            -> Lark Base (database)

App Router pages
  (dashboard) layout (sidebar + header)
    /          Command Center
    /kols      Creator catalog + smart search
    /kols/[id] Creator profile
    /live      Live MC Catalog with video preview
    /tech      Tech Creator catalog
    /settings  Account settings
```

---

## Pages

| Route        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `/`          | Command Center (redirects to /kols)                      |
| `/kols`      | Creator catalog -- smart search, filters, pagination     |
| `/kols/[id]` | Creator profile -- metrics, contact, charts              |
| `/live`      | Live MC Catalog -- video preview with Lark CDN           |
| `/tech`      | Tech Creator catalog -- specializations, contact         |
| `/settings`  | Account settings                                         |

---

## Data Flow

All data fetched server-side via `fetchRecords()` (POST /records/search):

| Table          | ID                  | Mapper              |
| -------------- | ------------------- | ------------------- |
| ALL_KOLS       | tbl5864QVOiEokTQ    | `recordToCreator()` |
| LIVE_MC_LIST   | tblozhTWBHelXqRR    | `recordToLiveMC()`  |
| KOL_TECH       | tbl8rJWSTEemTeJh    | `recordToTechKOL()` |

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
      page.tsx             Command Center
      kols/                Creator catalog + [kolId] profile
      live/                Live MC Catalog
      tech/                Tech Creator catalog
      settings/            Account settings
    layout.tsx             Root layout (ThemeProvider)
    globals.css            Tailwind v4 theme + utilities
  components/
    ui/                    UI primitives (button, card, badge, etc.)
    kol/                   KOLFeedCard, KOLContactEditor
    search/                CommandPalette (Cmd+K)
    sidebar.tsx            Desktop sidebar nav
    mobile-sidebar.tsx     Mobile drawer nav
    mobile-bottom-nav.tsx  Mobile bottom navigation
    header.tsx             Desktop header
  lib/
    lark-base.ts           Core fetcher (POST /records/search)
    cached-data.ts         Record mappers (recordToCreator, etc.)
    types/catalog.ts       Type definitions (Creator, LiveMC, TechKOL)
    categories.ts          Standardized category system (26 categories)
    smart-search.ts        Natural language search parser
    utils.ts               formatNumber, formatCurrency, getTierColor
    i18n-context.tsx       Internationalization context
  i18n/                    i18n config
  locales/                 Translation files
```

---

## Environment Variables

Set in Vercel project settings:

```
LARK_API_KEY               # Bearer token for lark-http-hype worker
NEXT_PUBLIC_LARK_API_URL   # Worker URL (default: https://lark-http-hype.hypelive.workers.dev)
```
