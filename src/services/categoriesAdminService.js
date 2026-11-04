import { supabase } from '../lib/supabaseClient.js';

const toCategory = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  shortName: r.short_name,
  winnerType: r.winner_type,
  positionGroup: r.position_group,
  sortOrder: r.sort_order,
  isActive: r.is_active,
});

const COLUMNS = 'id, slug, name, short_name, winner_type, position_group, sort_order, is_active';

// Includes inactive categories (the public site hides those).
export async function listAllCategories() {
  const { data, error } = await supabase.from('award_categories').select(COLUMNS).order('sort_order');
  if (error) throw error;
  return data.map(toCategory);
}

export async function saveCategory(category) {
  const row = {
    name: category.name.trim(),
    short_name: category.shortName.trim(),
    position_group: category.positionGroup,
    sort_order: category.sortOrder,
    is_active: category.isActive,
  };
  let query;
  if (category.id) {
    query = supabase.from('award_categories').update(row).eq('id', category.id);
  } else {
    // slug and winner type are fixed once a category exists, so winners stay valid.
    query = supabase.from('award_categories').insert({ ...row, slug: category.slug, winner_type: category.winnerType });
  }
  const { data, error } = await query.select(COLUMNS).single();
  if (error) throw error;
  return toCategory(data);
}
