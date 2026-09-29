# Boushra Services Textile Beauté

Website + shop for **Boushra** (Mbour, Sénégal): beauty salon, professional training, and a
boutique for gold jewellery, wigs, bags, shoes, watches and hair care.

Next.js 14 (App Router, JavaScript) · Tailwind · Supabase (Postgres, Auth, Storage, Edge
Functions, pg_cron) · Zustand · GSAP + Lenis. Site language: French. Currency: FCFA.

## What's inside

| Area | Routes |
| --- | --- |
| Storefront | `/` · `/boutique` (grouped by category) · `/categorie/[slug]` · `/produit/[slug]` · `/services` · `/a-propos` · `/contact` · `/panier` · `/commande` |
| Hidden admin (installable PWA, `noindex`, not linked anywhere) | `/espace-boushra` → dashboard, commandes, produits (add / edit / delete / épuisé / mettre en avant), avis, messages |
| SEO | per-page metadata + Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (BeautySalon/Store, Product, Breadcrumb, Services) |

**Checkout** offers *paiement à la livraison* or *paiement anticipé* (bank transfer / Wave /
Orange Money). Advance payments require a receipt screenshot, stored in a **private** bucket that
only admins can read. The admin validates or rejects the payment after checking their statement.

**Auto-cleanup:** orders that carry a payment screenshot are deleted, with the screenshot,
**30 days** after they were placed (Edge Function `cleanup-old-orders`, triggered daily by pg_cron).

**Security:** a signed-in user is *not* automatically an admin — they must be listed in the
`admins` table; every write policy checks `is_admin()`. Order prices and totals are recomputed in
the database (`prepare_order` trigger), so a tampered browser request can't change what's owed.

## Languages (FR / EN)

French is the default at the root (`/boutique`); English lives under `/en` (`/en/boutique`).
A FR/EN switcher sits in the header (and in the mobile menu); the choice is remembered with a
`NEXT_LOCALE` cookie, and `src/middleware.js` routes accordingly. Every page has `hreflang`
alternates and the sitemap lists both languages.

- All site wording: `src/i18n/dictionaries/fr.js` and `en.js` (same keys in both).
- Products: French name/description are required; `name_en` / `description_en` are optional
  fields in the admin product form (French is shown when they're empty).
- The admin panel has its own FR/EN switch (saved per device).

## Before going live — client to provide

- Real **payment accounts** → `PAYMENT_ACCOUNTS` in `src/config/site.js` (currently placeholders)
- Real **prices** for the 26 starter products (placeholders; edit from the admin)
- **Delivery fees** → `DELIVERY_ZONES` in `src/config/site.js` **and** `prepare_order()` in `supabase/schema.sql`
- Then set `NEXT_PUBLIC_DEMO_MODE=false` to remove the preview banner

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase env vars the storefront runs on the bundled catalog (`src/data/catalog.json`)
so it can be previewed; ordering, reviews and the admin need the database.

### Supabase — one command

```bash
npm run setup:supabase -- --token=sbp_... --ref=<project-ref> --admin-email=... --admin-password=...
```

Omit `--ref` to have it create a "boushra" project (needs a token from an org Owner/Admin).
It applies the schema, uploads the product photos to Supabase Storage, adds the starter
catalog, disables public sign-ups, creates the admin login, deploys the 30-day cleanup + cron,
writes `.env.local`, and finishes with a security smoke test. Safe to re-run.

### Supabase — by hand (same result)

1. Create a project (region: Paris `eu-west-3` is closest to Senegal).
2. SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Authentication → Sign In / Providers → **disable "Allow new users to sign up"**.
4. Authentication → Users → **Add user** (email + password, auto-confirm), then in SQL:
   ```sql
   insert into admins (user_id) select id from auth.users where email = 'admin@exemple.com';
   ```
5. Deploy the cleanup function and schedule it:
   ```bash
   npx supabase functions deploy cleanup-old-orders --project-ref <ref> --no-verify-jwt --use-api
   npx supabase secrets set CLEANUP_SECRET=<random-long-string> --project-ref <ref>
   ```
   Then run `supabase/cron.sql` with `__PROJECT_REF__` and `__CLEANUP_SECRET__` replaced.
6. `.env.local` (and the hosting provider): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (the real domain).

### Editing the starter catalog

`src/data/catalog.json` → `npm run seed:sql` regenerates `supabase/seed.sql`. Once the site is
live, manage products from the admin instead.

## Images

`source-photos/` (git-ignored) holds the 45 original Instagram exports kept after curation; 34
blank, blurry or off-topic ones were removed. Web-ready 4:5 WebP versions live in
`public/images/{produits,services,boutique}`.
