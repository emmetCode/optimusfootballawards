import { supabase } from '../lib/supabaseClient.js';

const toSeason = (r) => ({ id: r.id, label: r.label, startYear: r.start_year, isLatestOverride: r.is_latest_override });

export async function listSeasons() {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, label, start_year, is_latest_override')
    .order('start_year', { ascending: false });
  if (error) throw error;
  return data.map(toSeason);
}

export async function saveSeason({ id, startYear, isLatestOverride }) {
  // Only one season may be pinned, so clear any other pin first.
  if (isLatestOverride) {
    let clear = supabase.from('seasons').update({ is_latest_override: false }).eq('is_latest_override', true);
    if (id) clear = clear.neq('id', id);
    const { error: clearError } = await clear;
    if (clearError) throw clearError;
  }
  const row = { start_year: startYear, is_latest_override: Boolean(isLatestOverride) };
  const query = id ? supabase.from('seasons').update(row).eq('id', id) : supabase.from('seasons').insert(row);
  const { data, error } = await query.select('id, label, start_year, is_latest_override').single();
  if (error) throw error;
  return toSeason(data);
}

export async function deleteSeason(id) {
  const { error } = await supabase.from('seasons').delete().eq('id', id);
  if (error) throw error;
}
