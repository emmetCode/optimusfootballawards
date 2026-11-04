import { supabase } from '../lib/supabaseClient.js';
import { COUNTRY_NAMES } from '../constants/countries.js';

// The admin picks a country from a built-in list; the matching row in `countries` is created on demand.
export async function ensureCountry(code) {
  if (!code) return null;
  const name = COUNTRY_NAMES[code];
  if (!name) throw new Error(`Unknown country code: ${code}`);
  const { data, error } = await supabase
    .from('countries')
    .upsert({ iso_code: code, name }, { onConflict: 'iso_code' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
