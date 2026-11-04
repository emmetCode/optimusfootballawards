-- dev_placeholder.sql
-- OPTIONAL. Clearly fake sample data for local design work ONLY.
-- Do not run this against your real/production project.
-- Draft status keeps it invisible to the public site.

insert into public.seasons (start_year) values (2023), (2024) on conflict do nothing;

insert into public.countries (name, iso_code) values
  ('Placeholderland', 'PLA')
on conflict do nothing;

insert into public.clubs_teams (name, kind, country_id)
select 'PLACEHOLDER FC', 'club', id from public.countries where iso_code = 'PLA'
on conflict do nothing;

insert into public.people (full_name, role, country_id)
select 'PLACEHOLDER Player', 'player', id from public.countries where iso_code = 'PLA';
