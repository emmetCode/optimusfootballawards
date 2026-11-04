import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !publicKey) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env.local and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or ' +
      'VITE_SUPABASE_ANON_KEY).'
  );
}

// Use a public key only. Security is enforced by RLS and Storage policies in Supabase.
export const supabase = createClient(url, publicKey);
