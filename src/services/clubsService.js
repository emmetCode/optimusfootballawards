import { supabase } from '../lib/supabaseClient.js';
import { ensureCountry } from './countriesService.js';

const SELECT = 'id, name, kind, logo_path, country_id, countries(name, iso_code)';

const toClub = (r) => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  logoPath: r.logo_path,
  countryCode: r.countries?.iso_code ?? null,
  countryName: r.countries?.name ?? null,
});

export async function listClubs() {
  const { data, error } = await supabase.from('clubs_teams').select(SELECT).order('name');
  if (error) throw error;
  return data.map(toClub);
}

export async function saveClub({ id, name, kind, countryCode, logoPath }) {
  const countryId = await ensureCountry(countryCode);
  const row = { name: name.trim(), kind, country_id: countryId, logo_path: logoPath ?? null };
  const query = id ? supabase.from('clubs_teams').update(row).eq('id', id) : supabase.from('clubs_teams').insert(row);
  const { data, error } = await query.select(SELECT).single();
  if (error) throw error;
  return toClub(data);
}

export async function deleteClub(id) {
  const { error } = await supabase.from('clubs_teams').delete().eq('id', id);
  if (error) throw error;
}
