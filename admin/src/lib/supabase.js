// admin/src/lib/supabase.js
// Single supabase-js client for the admin app (auth + tables + storage).
//
// When the env vars are missing we don't throw (that would blank the whole
// app) — we export configError and AuthGate renders a setup notice instead.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const configError = !url || !key;

export const supabase = configError ? null : createClient(url, key);
