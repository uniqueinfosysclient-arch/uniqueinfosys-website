# Supabase setup — one-time checklist

The public site and the `admin/` app both talk to one Supabase project. Follow these
steps once, in order. Everything is on the **free tier**.

## 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) (create the account under the
   client's email if the client should own the infrastructure).
2. New project → name `uis-website-cms` → region **ap-south-1 (Mumbai)** → generate a
   strong database password (store it — it's rarely needed again).
3. Once created, note from **Settings → API**:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon public key** → this is `VITE_SUPABASE_ANON_KEY`
   - ⚠️ Never copy the `service_role` key anywhere — it bypasses all security.

## 2. Lock down auth (critical)

**Authentication → Sign In / Providers:**
- **Disable "Allow new users to sign up"** — the write policies trust any
  authenticated user, which is only safe when nobody can self-register.
- Leave anonymous sign-ins OFF.

## 3. Create the storage bucket

**Storage → New bucket:**
- Name: `gallery`
- **Public bucket: ON**
- File size limit: `5 MB`
- Allowed MIME types: `image/jpeg, image/png, image/webp`

## 4. Run the SQL

**SQL Editor → New query:**
1. Paste and run [`setup.sql`](setup.sql) — tables, RLS, storage policies.
2. Paste and run [`seed.sql`](seed.sql) — inserts the 6 current OneDrive links.
3. Paste and run [`offers.sql`](offers.sql) — the offers table behind the /offers page.
4. Paste and run [`leads.sql`](leads.sql) — the leads table behind the website enquiry form.

## 5. Create the admin user

**Authentication → Users → Add user → Create new user:**
- Email: the client's email
- Password: strong, generated
- ✅ Auto Confirm User

There is no signup or password-reset flow in the admin app. To change the password
later, do it here in the dashboard (Users → ⋯ → Reset password).

## 6. Environment variables

Both apps read the same two vars (Vite bakes them in at **build time**):

| Where | Vars |
|---|---|
| Local dev (site): `.env.local` in repo root | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Local dev (admin): `admin/.env.local` | same two |
| Vercel project #1 (public site) → Settings → Environment Variables | same two |
| Vercel project #2 (admin) → Settings → Environment Variables | same two |

The anon key is public by design (it ships in the JS bundle); row-level security is
the actual boundary. If you ever rotate keys, **redeploy both Vercel projects**.

### Server-side vars for the lead form (public site only)

The enquiry form on `/services/tally-capital` posts to `api/lead.js`, a Vercel
serverless function. It needs three more vars on **Vercel project #1 only**.
These are read at runtime by the function, never bundled — do **not** prefix
them with `VITE_`, or the service-role key ends up in the browser.

| Var | Where to get it |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role`. **Bypasses RLS — keep secret.** Enables *storing* leads. |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys (free tier ~3,000 emails/month). Enables the *email*. |
| `SUPABASE_URL` | Optional — falls back to `VITE_SUPABASE_URL`. |
| `LEAD_TO_EMAIL` | Optional. Defaults to `unisysjpr@yahoo.com` |
| `LEAD_FROM_EMAIL` | Optional. Defaults to `onboarding@resend.dev`. To send from your own domain, verify it in Resend first. |

The first two are independent: set either and the form works, set both and you
get storage *and* email. The form refuses an enquiry only when **both** are
missing, since there would be nowhere for the lead to go — the server log then
names exactly which var to set.

For local development put the same vars in `.env.local`; the dev server loads
them for `/api/*` automatically (see `apiDevServer` in `vite.config.js`).

Leads are written **server-side only** — the `leads` table has no anon policy at
all, so a scraped anon key cannot read or flood it. Every enquiry is stored
before the email is attempted, so a mail outage never loses a lead; failures show
as a **Mail failed** badge on the Website leads page in the admin panel.

## 7. Verify security (2 minutes, from any terminal)

```bash
# 1. Anonymous read works — should return the 6 seeded rows:
curl "$URL/rest/v1/download_links?select=product_key,variant_key" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON"

# 2. Anonymous write is refused — should return 401/403 (code 42501):
curl -X POST "$URL/rest/v1/news_items" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{"text":"hack"}'

# 3. Signups are refused — should return "Signups not allowed for this instance":
curl -X POST "$URL/auth/v1/signup" \
  -H "apikey: $ANON" -H "Content-Type: application/json" \
  -d '{"email":"x@example.com","password":"password123"}'
```

## 8. Keep-alive (free-tier pausing)

Free projects pause after ~7 days with **zero** API traffic. Real visitor traffic
counts, so a live site normally keeps itself awake. As insurance,
[`.github/workflows/supabase-keepalive.yml`](../.github/workflows/supabase-keepalive.yml)
pings the REST API twice a week — add these **GitHub repo secrets** and trigger it
once manually (Actions → Supabase keep-alive → Run workflow):

- `SUPABASE_URL` — the project URL
- `SUPABASE_ANON_KEY` — the anon key

If the project pauses anyway, the site silently falls back to its built-in content
(no strip, no gallery, hardcoded download links) and nothing breaks; restore it with
one click in the Supabase dashboard.

## Vercel: deploying the admin app (project #2)

1. Vercel → Add New Project → import the **same Git repo**.
2. **Root Directory: `admin`** (Edit → set it; this is the key step).
3. Framework preset: Vite (build `npm run build`, output `dist`) — auto-detected.
4. Add the two env vars, deploy. Optionally attach `admin.uniqueinfosys.com`.
5. Optional (skip rebuilds when the other app changes) — Settings → Git → Ignored
   Build Step:
   - admin project: `git diff --quiet HEAD^ HEAD -- ./admin`
   - main site project: `git diff --quiet HEAD^ HEAD -- . ':(exclude)admin'`
