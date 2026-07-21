-- ============================================================
-- Offers table — powers the /offers page.
-- Run this ONCE in the Supabase SQL editor, after setup.sql.
--
-- The page has no hardcoded offers any more: when this table has no
-- active rows the page shows its "between offer cycles" state, exactly
-- as it does today. Add a row and the page switches itself on.
--
-- One row may be flagged is_featured — it becomes the big dark hero
-- card with the countdown, and still appears in the grid below.
-- ============================================================

create table public.offers (
  id            uuid primary key default gen_random_uuid(),

  -- Card content
  title         text not null,
  description   text not null default '',
  category      text not null default 'tallyprime',  -- tallyprime | softtrade | custom | amc | bundles
  badge         text,                                -- e.g. '-25% OFF', 'BUNDLE', 'EMI · 0%'
  code          text,                                -- coupon code, e.g. 'UNIQUE25'

  -- Pricing: either the two numbers, or a free-text price_label instead
  original_price numeric,
  final_price    numeric,
  price_label    text,                               -- e.g. 'On request' (overrides the numbers)
  price_suffix   text default '+ GST',
  ends_label     text,                               -- e.g. 'Ends 31 May'

  highlight     boolean not null default false,      -- dark CTA button variant

  -- Featured (hero) card fields — only used when is_featured is true
  is_featured              boolean not null default false,
  featured_headline        text,                     -- big text, e.g. '25% off'
  featured_subtitle        text,                     -- italic line, e.g. 'TallyPrime Gold'
  featured_badge_secondary text,                     -- e.g. 'LIMITED'
  ends_at                  timestamptz,              -- countdown target; omit to hide the timer

  is_active     boolean not null default true,
  sort_order    integer not null default 0,          -- gaps of 10
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Only one offer can be the featured one.
create unique index offers_single_featured
  on public.offers (is_featured)
  where is_featured;

alter table public.offers enable row level security;

create policy "public read active offers" on public.offers
  for select using (is_active = true);

create policy "admin write offers" on public.offers
  for all to authenticated using (true) with check (true);
