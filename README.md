# دكتور لعندك — partners site

The Arabic, RTL landing page that recruits partners (doctors, nurses, pharmacies, pharmacy staff,
couriers, ambulance drivers) onto the platform. Next.js App Router, JavaScript, two dependencies
(`next`, `react`), no UI library and no 3D library.

- `DESIGN_SYSTEM.md` is the authoritative design sheet: one hue, one typeface, the motion curves,
  the artwork rules. Read it before changing anything visual.
- `AGENTS.md` — this Next.js version has breaking changes; check `node_modules/next/dist/docs/`
  rather than trusting older habits.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Live platform counters

The `#numbers` section shows three real figures from the platform's own database: partner
pharmacies, verified medical staff, and active patient accounts.

- **Where they come from:** `app/lib/stats.js` calls `rpc_public_stats` (Supabase, migration
  `doctorleandek_02/supabase/migrations/0076_public_stats.sql`) on the SERVER while the page
  renders. The anon key never reaches the browser, the numbers are in the served HTML for crawlers
  and for readers with JS off, and the count-up animation only ever replaces a correct value with
  the same correct value.
- **How fresh:** the backend recomputes the counts on a 15-minute cron into a single cached row, and
  this page revalidates on the same 15 minutes. Nothing here ever runs a `COUNT(*)` per visit.
- **When the backend is silent:** the section and its nav link are not rendered. It never shows
  zeros and never shows a number that did not come from the database.

### Configuration

Both values default to the production project in `app/site-config.js`, so a fresh clone builds with
no setup. Override them to point at another Supabase project:

| Variable | Meaning |
|---|---|
| `SUPABASE_URL` | project URL, e.g. `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | the anon/publishable key — public by design, RLS is the wall |

Server-side only, so deliberately **not** prefixed `NEXT_PUBLIC_`. On Vercel add them under
Settings → Environment Variables; locally put them in `.env.local`.

## Deploying

Vercel, from this directory as the project root. The page is statically prerendered with a
15-minute revalidate, so the counters refresh without a redeploy.
