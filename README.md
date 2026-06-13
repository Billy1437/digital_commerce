# GG Mart — digital_commerce

A storefront for selling game top-ups (Mobile Legends diamonds, PUBG UC) and
ranked game accounts to players in Myanmar and Thailand. Buyers order, pay by
QR with a local wallet (KBZPay, Wave Money, PromptPay), and upload a payment
slip; a human admin verifies every payment and delivers — diamonds to the
player's game ID, account credentials to their dashboard.

The whole point is trust: this market normally trades in Facebook groups and
Telegram chats where scams are common. GG Mart moves it onto a credible site
where every order is manually verified.

## Tech stack

- **Next.js (App Router)** + TypeScript — server components, server actions, route handlers
- **Tailwind CSS v4** + **shadcn/ui** — gaming-retailer dark theme (charcoal + signal red)
- **Prisma 7** (`pg` driver adapter) — schema and migrations
- **Supabase** — Postgres database, Auth, Storage (payment slips), Realtime
- **AWS S3** — listing screenshots (private bucket, served via an app proxy route)
- **Vercel** — hosting (deploy target)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Create `.env.local` (gitignored — never commit it):

```bash
# Supabase (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Prisma (Connect > ORM). Pooled for the app, direct for migrations.
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"

# AWS S3 (listing screenshots) — server-side only
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
S3_SCREENSHOTS_PREFIX=accounts_screenshots/
```

Then set up the database:

```bash
npx prisma migrate deploy   # apply schema, RLS, storage buckets, cron, etc.
npx prisma db seed          # sample games + packages (optional)
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio |
| `npm run make-admin -- <email>` | Promote a signed-up user to admin |

## How it's organized

- `src/app` — routes: storefront (`/`, `/games/[slug]`, `/accounts/[id]`),
  checkout + orders (`/checkout`, `/orders/[code]`), `/dashboard`, `/login`,
  and the role-gated `/admin` panel
- `src/app/actions` — server actions (orders, admin operations)
- `src/app/api` — route handlers (screenshot upload/proxy, auth confirm)
- `src/lib` — Prisma client, Supabase clients, S3, rate limiting, helpers
- `prisma` — schema, migrations, seed

## Notable design decisions

- **Two storage systems by purpose:** payment slips live in a private Supabase
  bucket (admins view them via signed URLs); listing screenshots live in a
  private S3 bucket, served through an `/api/screenshots` proxy so the bucket
  never goes public.
- **Row Level Security** on every table: catalog is public, buyers see only
  their own orders/credentials, credentials unlock only when an order is
  `COMPLETED`, and admin-only operations run through the `postgres` role.
- **Abandoned checkouts self-clean:** unpaid orders expire after 30 minutes
  (pg_cron + a self-heal on purchase), releasing reserved accounts back to sale.
- **Rate limiting** is centralized in Postgres so it works across serverless
  instances.

## Status

Core flow is complete: storefront, auth, checkout, QR payment + slip upload,
realtime order tracking, and a full admin panel (payment verification,
fulfillment, catalog CRUD). Remaining before launch: reviews, trust badges,
SEO, and production email (needs a custom domain).
