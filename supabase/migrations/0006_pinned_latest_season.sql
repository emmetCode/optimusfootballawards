-- A pinned latest season takes precedence even before it has published winners.
-- Without a pin, fall back to the newest season that has published winners.
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

grant select on public.latest_published_season to anon, authenticated;
