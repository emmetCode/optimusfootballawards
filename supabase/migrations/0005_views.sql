-- 0005_views.sql
-- Read models for the public site. security_invoker makes the views obey RLS,
-- so visitors can only ever see published records through them.

create or replace view public.published_winners
with (security_invoker = true) as
select
  w.id                                   as record_id,
  s.id                                   as season_id,
  s.label                                as season_label,
  s.start_year                           as season_start_year,
  c.id                                   as category_id,
  c.slug                                 as category_slug,
  c.name                                 as category_name,
  c.short_name                           as category_short_name,
  c.winner_type                          as winner_type,
  c.sort_order                           as category_sort_order,
  p.id                                   as person_id,
  p.full_name                            as person_name,
  coalesce(w.photo_path, p.photo_path)   as photo_path,
  t.id                                   as team_id,
  t.name                                 as team_name,
  t.logo_path                            as team_logo_path,
  coalesce(pc.name,      tc.name)        as country_name,
  coalesce(pc.iso_code,  tc.iso_code)    as country_iso,
  coalesce(pc.flag_path, tc.flag_path)   as country_flag_path,
  w.published_at
from public.winner_records w
join public.seasons          s  on s.id = w.season_id
join public.award_categories c  on c.id = w.category_id
left join public.people      p  on p.id = w.person_id
left join public.clubs_teams t  on t.id = w.team_id
left join public.countries   pc on pc.id = p.country_id
left join public.countries   tc on tc.id = t.country_id
where w.status = 'published';

-- Latest season rule:
--   1. An explicitly pinned season always wins, even before it has published winners.
--   2. Otherwise, the highest start_year with published winners wins.
create or replace view public.latest_published_season
with (security_invoker = true) as
select s.id, s.label, s.start_year
from public.seasons s
where s.is_latest_override
   or exists (
     select 1 from public.winner_records w
     where w.season_id = s.id and w.status = 'published'
   )
order by s.is_latest_override desc, s.start_year desc
limit 1;

grant select on public.published_winners       to anon, authenticated;
grant select on public.latest_published_season to anon, authenticated;
