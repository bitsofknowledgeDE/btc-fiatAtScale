import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False when the build had no Supabase env — callers show BokDataNotice. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  // createClient throws on an empty URL, so guard instead of crashing the app
  // (WP-1.3). Every consumer catches its own query error and renders the
  // shared data notice.
  console.error(
    '[fiatAtScale] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — live data is disabled.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://unconfigured.invalid',
  supabaseAnonKey || 'unconfigured',
);
