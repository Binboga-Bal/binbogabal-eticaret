# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Binboğa Kooperatif Balı** — a Turkish-language e-commerce platform for selling honey products. Built with Next.js 15 App Router, PostgreSQL via Prisma (hosted on Supabase, `eu-central-1`/Frankfurt), NextAuth.js, and integrated with the QNB Pay payment gateway and Dia ERP system.

## Common Commands

```bash
# Development
pnpm dev                  # Start dev server (Next.js)
pnpm build                # Production build
pnpm lint                 # ESLint

# Database (Prisma)
pnpm db:generate          # Regenerate Prisma client after schema changes
pnpm db:push              # Push schema to DB (PRIMARY workflow — no migrations folder exists)
pnpm db:migrate:dev       # Create and run a new migration (dev)
pnpm db:migrate           # Run pending migrations (production)
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed database (prisma/seed.ts)
```

**Package manager: pnpm** (not npm or yarn).

## Architecture

### App Router Layout

```
app/
  (shop)/          # Customer-facing storefront (default route group)
  admin/           # Admin dashboard — requires ADMIN/SUPERADMIN/EDITOR role
  api/             # API routes
    auth/          # NextAuth + registration
    admin/         # Admin CRUD endpoints
    orders/        # Order creation
    payment/       # QNB Pay callback
    cart/          # Coupon validation
    search/        # Product search
```

All `/admin/*` routes are protected by `middleware.ts` which checks the NextAuth session role.

### Key Directories

- `components/shop/` — customer-facing UI (header, home sections, product cards, checkout, cart)
- `components/admin/` — admin panel forms and tables
- `components/ui/` — shared primitives
- `lib/auth.ts` — NextAuth config (JWT strategy, Credentials provider, Prisma adapter)
- `lib/prisma.ts` — Prisma client singleton
- `lib/theme.ts` — **single source of truth for all colors and design tokens** (propagates to Tailwind and globals.css)
- `lib/payment/` — QNB Pay integration; Iyzico/Stripe are stubs
- `lib/dia-erp/` — Dia ERP sync (products, stock, orders)
- `store/cart.ts` — Zustand cart store
- `prisma/schema.prisma` — full database schema

### Database Models (Prisma + PostgreSQL / Supabase)

Core: `User`, `Product`, `ProductVariant`, `Category`, `HoneyType`, `Order`, `OrderItem`, `PaymentTransaction`, `Coupon`, `BlogPost`, `FAQ`, `Review`, `ErpSyncLog`, `SiteSetting`.

Role enum: `CUSTOMER | EDITOR | ADMIN | SUPERADMIN`
Order status: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED` (also `CANCELLED`, `REFUNDED`)
Payment provider: `QNB_PAY` (active), `IYZICO`/`STRIPE`/`MANUAL` (stubs)

### Design System

Always modify colors in `lib/theme.ts` — never hardcode hex values elsewhere. The theme object is imported by both Tailwind config and `styles/globals.css`. Brand colors: `honey` (#F9B10B), `honeyDark` (#C57930), `honeyBright` (#FCD908), `honeyLight` (#FCE7A5), `honeyCream` (#FFF8E7).

### Auth

`middleware.ts` protects `/admin/*` using the NextAuth session. API routes under `/api/admin/*` must additionally verify session role server-side. Session strategy is JWT; user role is encoded in the token.

### Path Alias

`@/` maps to the project root (e.g., `@/lib/prisma`, `@/components/ui/Button`).

### Deployment & Caching

- **Vercel region must match the DB** — `vercel.json` pins functions to `fra1` (Frankfurt) to co-locate with the Supabase DB. Without this, every query crosses regions (~100ms+ each).
- Catalog pages use ISR: the home page (`revalidate=300`) is statically rendered, and product detail (`revalidate=600`) is SSG via `generateStaticParams`. Product mutations (`/api/admin/products`) and ERP sync (`/api/admin/erp`) call `revalidatePath("/")`, `revalidatePath("/urunlerimiz")`, and `revalidatePath("/urunlerimiz/[slug]", "page")` to refresh these caches on-demand. `/urunlerimiz` (filter/search) stays dynamic because it reads `searchParams`.
- PostgreSQL does **not** auto-index foreign keys (unlike MySQL/InnoDB) — FK and common-filter columns are explicitly indexed in `schema.prisma`. Product name/shortDescription have `pg_trgm` GIN indexes for `contains` search.

## Environment Variables

See `.env.example`. Required groups:
- `DATABASE_URL` — PostgreSQL connection string (Supabase **pooler**, port 6543, `pgbouncer=true`) used at runtime
- `DIRECT_URL` — direct connection (port 5432) used by `db:push`/migrations
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `QNB_PAY_*` — payment gateway credentials (`QNB_PAY_SANDBOX=true` for dev)
- `DIA_PROXY_*` — Dia ERP proxy URL and key
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`
