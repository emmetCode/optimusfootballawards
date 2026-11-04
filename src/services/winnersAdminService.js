import { supabase } from '../lib/supabaseClient.js';

const SELECT = `
  id, season_id, category_id, person_id, team_id, photo_path, status, published_at, updated_at,
  seasons(label, start_year),
  award_categories(slug, name, short_name, winner_type, sort_order),
  people(full_name, photo_path, countries(name, iso_code)),
  clubs_teams(name, logo_path, countries(name, iso_code))
`;

const toRecord = (r) => ({
  id: r.id,
  seasonId: r.season_id,
  categoryId: r.category_id,
  personId: r.person_id,
  teamId: r.team_id,
  photoPath: r.photo_path,
  status: r.status,
  publishedAt: r.published_at,
  updatedAt: r.updated_at,
  seasonLabel: r.seasons?.label ?? '',
  seasonStartYear: r.seasons?.start_year ?? 0,
  category: r.award_categories
    ? {
        slug: r.award_categories.slug,
        name: r.award_categories.name,
        shortName: r.award_categories.short_name,
        winnerType: r.award_categories.winner_type,
        sortOrder: r.award_categories.sort_order,
      }
    : null,
  person: r.people
    ? {
        fullName: r.people.full_name,
        photoPath: r.people.photo_path,
        countryCode: r.people.countries?.iso_code ?? null,
        countryName: r.people.countries?.name ?? null,
      }
    : null,
  team: r.clubs_teams
    ? {
        name: r.clubs_teams.name,
        logoPath: r.clubs_teams.logo_path,
        countryCode: r.clubs_teams.countries?.iso_code ?? null,
        countryName: r.clubs_teams.countries?.name ?? null,
      }
    : null,
});

// Newest season first, then in category order.
export async function listWinnerRecords(seasonId) {
  let query = supabase.from('winner_records').select(SELECT);
  if (seasonId) query = query.eq('season_id', seasonId);
  const { data, error } = await query;
  if (error) throw error;
  return data
    .map(toRecord)
    .sort((a, b) => b.seasonStartYear - a.seasonStartYear || (a.category?.sortOrder ?? 0) - (b.category?.sortOrder ?? 0));
}

export async function getWinnerRecord(id) {
  const { data, error } = await supabase.from('winner_records').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toRecord(data) : null;
}

// Used to warn before creating a second winner for the same season and category.
export async function findWinnerFor(seasonId, categoryId) {
  const { data, error } = await supabase
    .from('winner_records')
    .select('id')
    .eq('season_id', seasonId)
    .eq('category_id', categoryId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function saveWinnerRecord({ id, seasonId, categoryId, personId, teamId, photoPath, status }) {
  const row = {
    season_id: seasonId,
    category_id: categoryId,
    person_id: personId ?? null,
    team_id: teamId ?? null,
    photo_path: photoPath ?? null,
    status,
  };
  const query = id ? supabase.from('winner_records').update(row).eq('id', id) : supabase.from('winner_records').insert(row);
  const { data, error } = await query.select('id').single();
  if (error) throw error;
  return data.id;
}

export async function setWinnerStatus(id, status) {
  const { error } = await supabase.from('winner_records').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteWinnerRecord(id) {
  const { error } = await supabase.from('winner_records').delete().eq('id', id);
  if (error) throw error;
}
