import { supabase } from '../lib/supabaseClient.js';
import { getImageUrl } from '../utils/imageUrl.js';
import { getAwardCategoryName } from '../utils/awardCategory.js';

// Converts a row from the published_winners view into the shape the UI uses.
function toWinner(row) {
  const isTeam = row.winner_type === 'team';
  return {
    id: row.record_id,
    seasonLabel: row.season_label,
    categorySlug: row.category_slug,
    categoryName: getAwardCategoryName(row.category_slug, row.category_name),
    winnerType: row.winner_type,
    name: isTeam ? row.team_name : row.person_name,
    photoUrl: getImageUrl(row.photo_path),
    teamName: row.team_name,
    teamLogoUrl: getImageUrl(row.team_logo_path),
    countryName: row.country_name,
    countryIso: row.country_iso,
    flagUrl: getImageUrl(row.country_flag_path),
  };
}

export async function fetchSeasonWinners(seasonId) {
  if (!seasonId) return [];
  const { data, error } = await supabase
    .from('published_winners')
    .select('*')
    .eq('season_id', seasonId)
    .order('category_sort_order', { ascending: true });
  if (error) throw error;
  return data.map(toWinner);
}
