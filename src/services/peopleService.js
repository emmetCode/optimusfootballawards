import { supabase } from '../lib/supabaseClient.js';
import { ensureCountry } from './countriesService.js';

const SELECT = 'id, full_name, role, photo_path, country_id, countries(name, iso_code)';

const toPerson = (r) => ({
  id: r.id,
  fullName: r.full_name,
  role: r.role,
  photoPath: r.photo_path,
  countryCode: r.countries?.iso_code ?? null,
  countryName: r.countries?.name ?? null,
});

export async function listPeople() {
  const { data, error } = await supabase.from('people').select(SELECT).order('full_name');
  if (error) throw error;
  return data.map(toPerson);
}

export async function savePerson({ id, fullName, role, countryCode, photoPath }) {
  const countryId = await ensureCountry(countryCode);
  const row = { full_name: fullName.trim(), role, country_id: countryId, photo_path: photoPath ?? null };
  const query = id ? supabase.from('people').update(row).eq('id', id) : supabase.from('people').insert(row);
  const { data, error } = await query.select(SELECT).single();
  if (error) throw error;
  return toPerson(data);
}

export async function deletePerson(id) {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}
