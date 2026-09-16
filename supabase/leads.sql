-- ============================================================
-- Website lead capture (TallyCapital enquiry form, and any
-- future form that posts to /api/lead).
--
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL),
-- after supabase/setup.sql.
--
-- Security model — deliberately different from the CMS tables:
--   The public site NEVER writes here with the anon key. Writes
--   come only from the Vercel serverless function /api/lead,
--   which uses the service-role key and therefore bypasses RLS.
--   So there is no anon INSERT policy: an anon client can do
--   nothing at all with this table. That keeps the form off the
--   database's attack surface entirely — a scraped anon key
--   cannot be used to flood the leads table or read enquiries.
--
--   The signed-in admin (authenticated role) gets full access so
--   the Leads page in the admin panel can list, mark and delete.
-- ============================================================

create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  source        text not null default 'tally-capital',  -- which form produced it
  name          text not null,
  phone         text not null,
  email         text not null,
  comments      text,
  page_url      text,                                   -- where the form was submitted from
  email_sent    boolean not null default false,         -- did the notification mail go out?
  email_error   text,                                   -- provider error, when it did not
  is_handled    boolean not null default false,         -- admin ticks this once actioned
  created_at    timestamptz not null default now()
);

-- Newest first is the only ordering the admin page uses.
create index leads_created_at_idx on public.leads (created_at desc);

-- ---------- Row Level Security ----------

alter table public.leads enable row level security;

-- No anon policy on purpose — see the note above. The service-role
-- key used by /api/lead bypasses RLS, so inserts still work.

-- Authenticated (the single admin) full access.
-- SAFE ONLY because new-user signups are disabled in Auth settings
-- (same assumption as setup.sql — see supabase/SETUP.md).
create policy "admin read leads"  on public.leads
  for select to authenticated using (true);
create policy "admin write leads" on public.leads
  for all to authenticated using (true) with check (true);
