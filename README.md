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
    /          Redirects to /kols
    /kols      Creator catalog + smart search
    /kols/[id] Creator profile
    /live      Live MC Catalog with video preview
```

---

## Pages

| Route        | Mode              | Description                                              |
| ------------ | ----------------- | -------------------------------------------------------- |
| `/`          | static (redirect) | Redirects to `/kols`                                     |
| `/kols`      | static, 300s ISR  | Creator catalog — smart search, filters, pagination      |
| `/kols/[id]` | dynamic           | Creator profile — metrics, contact, recharts             |
| `/live`      | static, 300s ISR  | Live MC Catalog — video preview with `#t=0.1` first-frame |

---

## Data Flow

All data fetched server-side via two helpers in `lib/lark-base.ts`:

- `fetchRecords(tableId, opts)` → `POST /records/search` (list + filter)
- `fetchRecord(tableId, recordId, opts)` → `GET /records/:app/:table/:id` (single lookup)

| Table          | ID                  | Mapper              |
| -------------- | ------------------- | ------------------- |
| ALL_KOLS       | tbl5864QVOiEokTQ    | `recordToCreator()` |
| LIVE_MC_LIST   | tblozhTWBHelXqRR    | `recordToLiveMC()`  |

Media URLs for video/image attachments are built via `buildMediaUrl(token, tableId)` →
`${WORKER}/api/image/${token}?tableId=${tableId}`.

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
      page.tsx             Root — redirects to /kols
      kols/                Creator catalog + [kolId] profile
      live/                Live MC Catalog (video grid, wire-map)
    layout.tsx             Root layout (ThemeProvider)
    globals.css            Tailwind v4 theme + utilities
  components/
    ui/                    UI primitives (button, card, badge, chart, etc.)
    kol/                   KOLFeedCard (avatar + platform gradient)
    search/                CommandPalette (Cmd+K)
    sidebar.tsx            Desktop sidebar nav
    mobile-sidebar.tsx     Mobile drawer nav
    mobile-bottom-nav.tsx  Mobile bottom navigation
    header.tsx             Desktop header
    query-provider.tsx     TanStack Query provider
    theme-provider.tsx     next-themes wrapper (default: dark)
  lib/
    lark-base.ts           fetchRecords + fetchRecord + buildMediaUrl
    cached-data.ts         Record mappers (recordToCreator, etc.)
    query-client.ts        TanStack QueryClient singleton
    query-keys.ts          larkKeys factory for query keys
    types/catalog.ts       Type definitions (Creator, LiveMC, ErrorProps)
    categories.ts          Standardized creator categories (26 entries)
    brand-categories.ts    Brand → content-category map (live MC page)
    smart-search.ts        Natural language search parser
    utils.ts               formatNumber, formatCurrency, getTierColor, cn
    i18n-context.tsx       Internationalization context
  i18n/                    i18n config
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

**Always-dark media frames** — `/live` and `wire-map` use `bg-zinc-900/800/950` intentionally
for video card backgrounds, regardless of theme. Not a token bypass.
