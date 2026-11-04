import { supabase } from '../lib/supabaseClient.js';

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('award_categories')
    .select('slug, name, short_name, winner_type, position_group, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;

  return data.map((c) => ({
    slug: c.slug,
    name: c.name,
    shortName: c.short_name,
    winnerType: c.winner_type,
    positionGroup: c.position_group,
  }));
}
