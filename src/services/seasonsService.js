import { supabase } from '../lib/supabaseClient.js';

// All seasons (newest first, by start_year) plus the id of the pinned season,
// or the newest season with published winners when none is pinned.
export async function fetchSeasonOptions() {
  const [seasonsRes, latestRes] = await Promise.all([
    supabase.from('seasons').select('id, label, start_year').order('start_year', { ascending: false }),
    supabase.from('latest_published_season').select('id').maybeSingle(),
  ]);
  if (seasonsRes.error) throw seasonsRes.error;
  if (latestRes.error) throw latestRes.error;

  return {
    seasons: seasonsRes.data.map((s) => ({ id: s.id, label: s.label, startYear: s.start_year })),
    latestId: latestRes.data?.id ?? null,
  };
}
