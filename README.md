# TallyHub Website

A TallyPrime partner marketing site built for an Indian audience -- showcasing products, pricing, services, and contact information.

## Tech Stack

- **Vite 8** -- fast dev server and optimized production builds
- **React 18** -- component-based UI
- **Tailwind CSS v4** -- utility-first styling with custom theme
- **React Router v6** -- client-side routing with `BrowserRouter`
- **lucide-react** -- icon library

## Getting Started

### Prerequisites

- Node.js 18+

### Install and run

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # preview the production build locally
```

## Project Structure

```
src/
  app.jsx            # All home-page sections and shared components
                     # (Hero, Pricing, Services, About, FAQ, Contact, etc.)
  router.jsx         # Routing, nav, footer, layout, app entry point
  config/
    site.js          # Brand config (name, phones, socials, address, etc.)
  lib/cms.js         # CMS data layer (fetch + fallback, see below)
  data/downloads.js  # Fallback installer URLs when the CMS is offline
  index.css          # Tailwind theme extensions + custom animations
admin/               # Separate admin panel app (own Vite project, see below)
supabase/            # One-time Supabase setup: setup.sql, seed.sql, SETUP.md
public/
  favicon.svg        # Brand favicon
index.html           # Vite entry point with SEO meta tags
```

## Admin-managed content (CMS)

Three things on the site are editable by the client through the admin panel in
`admin/` — a separate Vite app deployed as its own Vercel project, backed by a
free-tier Supabase project (Postgres + Auth + Storage):

- **Homepage news strip** — rotating updates pill under the nav (`src/components/NewsStrip.jsx`); hidden when there are no active items
- **About-page gallery** — photo slideshow (`src/components/AboutGallery.jsx`); hidden when there are no active photos
- **Download links** — the 6 SoftTrade installer URLs on `/downloads` and the three product pages

The public site reads Supabase via plain `fetch` (`src/lib/cms.js`, no SDK). If
the env vars are unset or Supabase is unreachable, the site renders exactly as it
would without a CMS: no strip, no gallery, hardcoded download links from
`src/data/downloads.js`.

Setup (one time): follow `supabase/SETUP.md`. Env vars for **both** apps:

```
VITE_SUPABASE_URL=       # Supabase → Settings → API → Project URL
VITE_SUPABASE_ANON_KEY=  # Supabase → Settings → API → anon public key
```

Local: `.env.local` (site) and `admin/.env.local` (admin). Production: set on both
Vercel projects. Admin app dev: `cd admin && npm install && npm run dev`.

## Configuration

All brand info, contact details, and social links live in `src/config/site.js`. Update values there to change them site-wide:

- Brand name and tagline
- Phone numbers (sales and support)
- WhatsApp number
- Email addresses
- Office address
- Business hours
- Social media URLs

## Deployment Notes

This app uses `BrowserRouter`, so the hosting provider must rewrite all unknown paths to `/index.html` for client-side routing to work.

**Netlify** -- create a `public/_redirects` file:
```
/*    /index.html   200
```

**Vercel** -- create a `vercel.json` at the repo root:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Nginx** -- add to the server block:
```nginx
location / {
    try_files $uri /index.html;
}
```

## TODO

- Replace placeholder contact info in `src/config/site.js` with real values
- Wire both forms to a real backend (Formspree, EmailJS, or custom API) -- currently they fake-submit with a timeout
- Fill in the placeholder sub-pages under `/products/*` and `/solutions/*`
