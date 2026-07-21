-- ============================================================
-- Supabase setup for Unique Info Systems CMS
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL).
-- Creates the three content tables, RLS policies, and the
-- storage policies for the public `gallery` bucket.
--
-- BEFORE running: create the `gallery` storage bucket in
-- Dashboard → Storage (Public = ON, 5 MB limit, MIME types
-- image/jpeg, image/png, image/webp). See supabase/SETUP.md.
-- ============================================================

-- ---------- Tables ----------

create table public.news_items (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  link_url    text,                          -- optional; internal path (/offers) or https URL
  link_label  text,                          -- optional, e.g. 'Learn more'
  is_active   boolean not null default true,
  sort_order  integer not null default 0,    -- gaps of 10; admin inserts use max+10
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,                -- object path inside the 'gallery' bucket
  image_url    text not null,                -- denormalized public URL (site never builds URLs)
  alt_text     text not null default '',
  caption      text default '',
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create table public.download_links (
  id          uuid primary key default gen_random_uuid(),
  product_key text not null,                 -- 'mandi' | 'brokwin' | 'coldwin'
  variant_key text not null,                 -- 'single' | 'multi'
  url         text not null,                 -- OneDrive URLs ~500 chars; text is unbounded
  updated_at  timestamptz not null default now(),
  unique (product_key, variant_key)
);

-- ---------- Row Level Security ----------

alter table public.news_items     enable row level security;
alter table public.gallery_images enable row level security;
alter table public.download_links enable row level security;

-- Anonymous/public read: active rows only (download_links: all rows)
create policy "public read active news"    on public.news_items
  for select using (is_active = true);
create policy "public read active gallery" on public.gallery_images
  for select using (is_active = true);
create policy "public read downloads"      on public.download_links
  for select using (true);

-- Authenticated (the single admin) full access — includes SELECT of inactive rows.
-- SAFE ONLY because new-user signups are disabled in Auth settings (see SETUP.md).
create policy "admin write news"      on public.news_items
  for all to authenticated using (true) with check (true);
create policy "admin write gallery"   on public.gallery_images
  for all to authenticated using (true) with check (true);
create policy "admin write downloads" on public.download_links
  for all to authenticated using (true) with check (true);

-- ---------- Storage policies (bucket: gallery) ----------

create policy "public read gallery"  on storage.objects
  for select using (bucket_id = 'gallery');
create policy "admin insert gallery" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery');
create policy "admin update gallery" on storage.objects
  for update to authenticated using (bucket_id = 'gallery');
create policy "admin delete gallery" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery');
