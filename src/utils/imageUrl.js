import { supabase } from '../lib/supabaseClient.js';
import { STORAGE_BUCKET } from '../constants/config.js';

// Turns a storage path (e.g. "people/kroos.jpg") into a public URL. No network request is made.
export function getImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
