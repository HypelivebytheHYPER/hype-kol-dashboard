# Hype KOL Dashboard

A world-class KOL (Key Opinion Leader) and Live Seller discovery dashboard for Hype marketing agency.

## Features

### 8-Layer Page Architecture

1. **Command Center** (`/`) - Executive overview with stats, trending KOLs, and active campaigns
2. **Discovery Engine** (`/discovery`) - Multi-dimensional KOL filtering with 15+ filters
3. **KOL Profile** (`/kols/[id]`) - Comprehensive profile with analytics and campaign history
4. **Live Center** (`/live`) - Real-time monitoring of live commerce streams
5. **Campaign Manager** (`/campaigns`) - End-to-end campaign planning and tracking
6. **Pricing Intelligence** (`/pricing`) - Rate comparison and margin optimization
7. **OOH Media Planner** (`/media-planner`) - Integrated KOL + outdoor media planning
8. **Staff Tools** (`/settings`) - Internal operations and management

## Tech Stack

- **Framework**: Next.js 16.1.6 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Inter (UI), JetBrains Mono (numbers)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
my-app/
├── app/
│   ├── (dashboard)/           # Dashboard pages with sidebar layout
│   │   ├── page.tsx           # Command Center (home)
│   │   ├── discovery/         # Discovery Engine
│   │   ├── kols/              # KOL profiles
│   │   ├── live/              # Live Center
│   │   ├── campaigns/         # Campaign Manager
│   │   ├── pricing/           # Pricing Intelligence
│   │   └── media-planner/     # OOH Media Planner
│   ├── settings/              # Settings page (separate layout)
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── kol/                   # KOL-specific components
│   ├── search/                # Search components
│   ├── analytics/             # Analytics components
│   └── campaigns/             # Campaign components
├── hooks/                     # React hooks (TanStack Query)
├── lib/
│   ├── types/                 # TypeScript type definitions
│   ├── lark-api.ts            # Lark Base API client
│   ├── search-algorithm.ts    # Match scoring algorithm
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## API Integration

The dashboard connects to a Cloudflare Worker at `lark-http-hype.hypelive.workers.dev` for Lark Base data:

- `GET /api/kols` - Fetch KOLs with filters
- `GET /api/kols/[id]` - Fetch single KOL
- `GET /api/kols/live` - Fetch live KOLs
- `GET /api/campaigns` - Fetch campaigns
- `POST /api/campaigns` - Create campaign
- `PATCH /api/campaigns/[id]` - Update campaign
- `GET /api/rates` - Fetch rate cards

## Design System

### Colors
- Background: `#0A0A0A`
- Card: `#141414`
- Primary: `#6366F1` (Indigo)
- Accent: `#22C55E` (Green for positive metrics)
- Border: `rgba(255, 255, 255, 0.08)`

### Typography
- Display: 48px/1.1/-0.02em
- Title: 32px/1.2/-0.02em
- Body: 14px/1.5/0
- Numbers use JetBrains Mono

## Environment Variables

```bash
NEXT_PUBLIC_LARK_API_URL=https://lark-http-hype.hypelive.workers.dev
```

## Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Next.js and shadcn/ui
- [x] Dashboard layout with sidebar and header
- [x] Command Palette (Cmd+K)
- [x] Dark theme design system

### Phase 2: Core Features ✅
- [x] Discovery page with filters
- [x] KOL profile page
- [x] Live Center with real-time updates
- [x] Campaign manager

### Phase 3: Intelligence ✅
- [x] Pricing comparison
- [x] Margin calculator
- [x] OOH Media Planner

### Phase 4: Integration
- [ ] Connect to Lark Base API
- [ ] Webhook integration for live status
- [ ] Real-time updates via WebSocket
- [ ] Authentication

### Phase 5: Polish
- [ ] Animations and transitions
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] User onboarding
