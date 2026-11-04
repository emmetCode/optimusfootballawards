import { supabase } from '../lib/supabaseClient.js';

async function countRows(table, applyFilter) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (applyFilter) query = applyFilter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

// Real counts, read through RLS as the signed-in admin (so drafts are included).
export async function fetchDashboardCounts() {
  const [seasons, published, drafts, people, clubs] = await Promise.all([
    countRows('seasons'),
    countRows('winner_records', (q) => q.eq('status', 'published')),
    countRows('winner_records', (q) => q.eq('status', 'draft')),
    countRows('people'),
    countRows('clubs_teams'),
  ]);
  return { seasons, published, drafts, people, clubs };
}

// Every image path currently referenced by a record, so the Images page can mark files as "in use".
export async function fetchUsedImagePaths() {
  const [people, clubs, winners] = await Promise.all([
    supabase.from('people').select('photo_path'),
    supabase.from('clubs_teams').select('logo_path'),
    supabase.from('winner_records').select('photo_path'),
  ]);
  for (const res of [people, clubs, winners]) if (res.error) throw res.error;
  const used = new Set();
  people.data.forEach((r) => r.photo_path && used.add(r.photo_path));
  clubs.data.forEach((r) => r.logo_path && used.add(r.logo_path));
  winners.data.forEach((r) => r.photo_path && used.add(r.photo_path));
  return used;
}
