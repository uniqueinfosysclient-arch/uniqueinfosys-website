// src/lib/cms.js
//
// The public site's entire CMS data layer — plain fetch against the
// Supabase REST API (PostgREST) with the anon key. No SDK dependency.
//
// Design rules:
//   - When env vars are unset (local dev without Supabase), every fetcher
//     no-ops and consumers render their built-in fallback — the site works
//     exactly as it did before the CMS existed.
//   - Errors are swallowed (dev-only console.warn): a Supabase outage must
//     never break the site.
//   - useCmsData returns null until data arrives (or when unavailable),
//     then an array. Consumers treat null/[] as "render fallback".

import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cmsEnabled = Boolean(BASE && KEY);

async function rest(query) {
  if (!cmsEnabled) return null;
  const res = await fetch(`${BASE}/rest/v1/${query}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8000) : undefined,
  });
  if (!res.ok) throw new Error(`cms ${res.status}`);
  return res.json();
}

export const fetchNews = () =>
  rest('news_items?select=id,text,link_url,link_label&is_active=eq.true&order=sort_order.asc,created_at.asc');

export const fetchGallery = () =>
  rest('gallery_images?select=id,image_url,alt_text,caption&is_active=eq.true&order=sort_order.asc,created_at.asc');

export const fetchDownloads = () =>
  rest('download_links?select=product_key,variant_key,url');

export const fetchOffers = () =>
  rest('offers?select=*&is_active=eq.true&order=sort_order.asc,created_at.asc');

// ---- sessionStorage stale-while-revalidate cache ----

const cacheKeyFor = (key) => `cms:${key}`;

function readSessionCache(key) {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(cacheKeyFor(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key, data) {
  if (!key) return;
  try {
    sessionStorage.setItem(cacheKeyFor(key), JSON.stringify(data));
  } catch {
    /* storage full/blocked — cache is best-effort */
  }
}

/**
 * Fetch CMS data with a sessionStorage stale-while-revalidate cache.
 * Returns null while unavailable/loading (first visit), the cached array
 * instantly on repeat visits, and fresh data once the network resolves.
 */
export function useCmsData(fetcher, cacheKey) {
  const [data, setData] = useState(() => (cmsEnabled ? readSessionCache(cacheKey) : null));

  useEffect(() => {
    if (!cmsEnabled) return undefined;
    let on = true;
    fetcher()
      .then((fresh) => {
        if (on && Array.isArray(fresh)) {
          setData(fresh);
          writeSessionCache(cacheKey, fresh);
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[cms]', err);
      });
    return () => { on = false; };
    // fetcher/cacheKey are stable module-level values at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
