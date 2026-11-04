-- 0001_schema.sql
-- Core tables, constraints, indexes, triggers.
-- Run migrations in numeric order in the Supabase SQL Editor.

-- ---------- Enums ----------
create type public.winner_type   as enum ('player', 'coach', 'team');
create type public.person_role   as enum ('player', 'coach');
create type public.team_kind     as enum ('club', 'national_team');
create type public.record_status as enum ('draft', 'published');

-- ---------- Shared trigger: keep updated_at current ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- countries ----------
create table public.countries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  iso_code   text not null unique check (char_length(iso_code) between 2 and 3),
  flag_path  text,                       -- path inside the awards-media bucket
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- seasons ----------
-- start_year is the ordering field. label (e.g. 2024–25) is derived from it,
-- so the two can never disagree.
create table public.seasons (
  id                 uuid primary key default gen_random_uuid(),
  start_year         integer not null unique check (start_year between 1900 and 2100),
  label              text generated always as (
                       start_year::text || '–' || lpad(((start_year + 1) % 100)::text, 2, '0')
                     ) stored,
  is_latest_override boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- At most one season may be flagged as the explicit "latest" override.
create unique index seasons_single_latest_override
  on public.seasons (is_latest_override)
  where is_latest_override;

-- ---------- award_categories ----------
-- New categories are just new rows; no application change needed.
create table public.award_categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null,          -- "The Optimus Goalkeeper of the Season"
  short_name     text not null,          -- "Goalkeeper"
  winner_type    public.winner_type not null,
  position_group text not null,          -- goalkeeper | defence | midfield | attack | team | staff
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- people (players and coaches) ----------
create table public.people (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null check (char_length(trim(full_name)) > 0),
  role       public.person_role not null,
  photo_path text,
  country_id uuid references public.countries (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index people_name_idx    on public.people (lower(full_name));
create index people_country_idx on public.people (country_id);

-- ---------- clubs_teams ----------
create table public.clubs_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(trim(name)) > 0),
  kind       public.team_kind not null default 'club',
  logo_path  text,
  country_id uuid references public.countries (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, kind)
);
create index clubs_teams_country_idx on public.clubs_teams (country_id);

-- ---------- winner_records ----------
-- One winner per season + category (shared awards are not supported).
-- team_id is stored per record, so a player's club is correct for THAT season
-- even after later transfers.
create table public.winner_records (
  id           uuid primary key default gen_random_uuid(),
  season_id    uuid not null references public.seasons (id)          on delete restrict,
  category_id  uuid not null references public.award_categories (id) on delete restrict,
  person_id    uuid references public.people (id)      on delete restrict,
  team_id      uuid references public.clubs_teams (id) on delete restrict,
  photo_path   text,                     -- optional season-specific photo override
  status       public.record_status not null default 'draft',
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (season_id, category_id)
);
create index winner_records_season_status_idx on public.winner_records (season_id, status);
create index winner_records_category_idx      on public.winner_records (category_id);
create index winner_records_person_idx        on public.winner_records (person_id);
create index winner_records_team_idx          on public.winner_records (team_id);

-- ---------- Validation: the winner must match the category type ----------
-- A CHECK constraint cannot read other tables, so a trigger does this.
create or replace function public.validate_winner_record()
returns trigger
language plpgsql
as $$
declare
  cat_type    public.winner_type;
  p_role public.person_role;
begin
  select winner_type into cat_type
  from public.award_categories
  where id = new.category_id;

  if cat_type = 'team' then
    if new.team_id is null then
      raise exception 'Team awards require a team.';
    end if;
    if new.person_id is not null then
      raise exception 'Team awards cannot have a person winner.';
    end if;
  else
    if new.person_id is null then
      raise exception 'This award requires a player or coach.';
    end if;
    select role into p_role from public.people where id = new.person_id;
    if p_role::text <> cat_type::text then
      raise exception 'This award expects a % but the selected person is a %.', cat_type, p_role;
    end if;
  end if;

  -- published_at bookkeeping
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  elsif new.status = 'draft' then
    new.published_at := null;
  end if;

  return new;
end;
$$;

create trigger winner_records_validate
  before insert or update on public.winner_records
  for each row execute function public.validate_winner_record();

-- ---------- updated_at triggers ----------
create trigger countries_updated_at        before update on public.countries
  for each row execute function public.set_updated_at();
create trigger seasons_updated_at          before update on public.seasons
  for each row execute function public.set_updated_at();
create trigger award_categories_updated_at before update on public.award_categories
  for each row execute function public.set_updated_at();
create trigger people_updated_at           before update on public.people
  for each row execute function public.set_updated_at();
create trigger clubs_teams_updated_at      before update on public.clubs_teams
  for each row execute function public.set_updated_at();
create trigger winner_records_updated_at   before update on public.winner_records
  for each row execute function public.set_updated_at();
