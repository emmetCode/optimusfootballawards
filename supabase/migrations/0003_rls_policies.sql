-- 0003_rls_policies.sql
-- Admin identity + Row Level Security. RLS is the real security boundary.

-- ---------- admins ----------
-- Only people listed here are administrators. No client role can write to this table;
-- rows are added manually via supabase/admin_bootstrap.sql in the SQL Editor.
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may check whether THEY are an admin (used by the frontend).
create policy "admins: read own row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- ---------- is_admin() ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Lookup/reference tables: public read, admin write ----------
alter table public.countries        enable row level security;
alter table public.seasons          enable row level security;
alter table public.award_categories enable row level security;
alter table public.people           enable row level security;
alter table public.clubs_teams      enable row level security;
alter table public.winner_records   enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['countries', 'seasons', 'award_categories', 'people', 'clubs_teams']
  loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || ': public read', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || ': admin write', t);
  end loop;
end;
$$;

-- ---------- winner_records: public sees PUBLISHED only; admin sees and edits everything ----------
create policy "winner_records: public read published"
  on public.winner_records for select
  to anon, authenticated
  using (status = 'published');

create policy "winner_records: admin all"
  on public.winner_records for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
