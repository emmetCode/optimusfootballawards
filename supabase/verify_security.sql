-- verify_security.sql
-- Safety check. Run it in the Supabase SQL Editor after setup and after every database change.
-- It tries to write as an anonymous visitor and as a signed-in non-admin; every attempt is expected to be blocked.
-- It makes no permanent changes: the whole script is one transaction, and it ends with an error (which rolls
-- everything back) if any attempt was NOT blocked.
--
--   * If everything is correct you see a row: "All security checks passed".
--   * If anything is wrong the script stops with an error that lists every problem found.

do $$
declare
  problems text[] := '{}';
  t        text;
  n        bigint;
  n_pub    bigint;
  rc       bigint;
  persona  text;
  claims   text;
  tables   text[] := array['countries', 'seasons', 'award_categories', 'people', 'clubs_teams', 'winner_records', 'admins'];
  v_season uuid;
  v_cat    uuid;
  v_person uuid;
  stmt     text;
begin
  -- 1. Row Level Security must be ON for every table in the public schema.
  for t in
    select c.relname
    from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  loop
    problems := problems || format('RLS is OFF on public.%s', t);
  end loop;

  -- 2. The public views must obey RLS (otherwise they could expose drafts).
  for t in
    select c.relname
    from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relname in ('published_winners', 'latest_published_season')
      and coalesce(c.reloptions::text, '') !~ 'security_invoker=(true|on)'
  loop
    problems := problems || format('View public.%s is not security_invoker', t);
  end loop;

  -- 3. The storage bucket must exist, be size-limited and restricted to images.
  select count(*) into n from storage.buckets
   where id = 'awards-media' and file_size_limit is not null and allowed_mime_types is not null;
  if n = 0 then
    problems := problems || 'Storage bucket awards-media is missing, or has no size limit / allowed file types';
  end if;

  -- Reference numbers, read with full privileges.
  select count(*) into n_pub from public.winner_records where status = 'published';

  -- A valid sample winner row, so the insert test for winner_records reaches the RLS check
  -- (a database trigger rejects invalid rows before RLS is consulted). Needs at least one season and person.
  select s.id, c.id, p.id into v_season, v_cat, v_person
    from public.seasons s
    cross join public.award_categories c
    join public.people p on p.role::text = c.winner_type::text
   where c.winner_type <> 'team'
   limit 1;

  -- 4. Simulate each kind of visitor and try to read and write.
  foreach persona in array array['anon', 'authenticated'] loop
    -- "authenticated" here is a signed-in user who is NOT an administrator.
    claims := case when persona = 'authenticated'
      then '{"sub":"00000000-0000-0000-0000-00000000dead","role":"authenticated"}' else '{"role":"anon"}' end;
    perform set_config('request.jwt.claims', claims, true);
    execute format('set local role %I', persona);

    -- Visitors only ever see published winners.
    select count(*) into n from public.winner_records;
    if n <> n_pub then
      problems := problems || format('%s can see %s winner records but only %s are published (drafts may be exposed)', persona, n, n_pub);
    end if;

    -- Nobody but administrators may read the admins list.
    select count(*) into n from public.admins;
    if n <> 0 then
      problems := problems || format('%s can read the admins table', persona);
    end if;

    if public.is_admin() then
      problems := problems || format('%s is wrongly treated as an administrator', persona);
    end if;

    -- Storage: no listing and no uploads for non-admins.
    select count(*) into n from storage.objects;
    if n <> 0 then
      problems := problems || format('%s can list storage objects', persona);
    end if;

    -- Every write must be blocked.
    foreach t in array tables loop
      stmt := format('insert into public.%I default values', t);
      if t = 'winner_records' then
        stmt := case when v_season is null then null
                else format('insert into public.winner_records (season_id, category_id, person_id, status) values (%L, %L, %L, ''draft'')', v_season, v_cat, v_person) end;
      end if;
      begin
        -- stmt is null for winner_records when there is no sample data yet: re-run after adding a season and a person
        if stmt is not null then
          execute stmt;
          problems := problems || format('%s was able to INSERT into %s', persona, t);
        end if;
      exception
        when insufficient_privilege then null;  -- blocked: good
        when others then
          problems := problems || format('%s INSERT into %s failed for another reason (%s) - check its policies', persona, t, sqlerrm);
      end;

      begin
        execute format('update public.%I set created_at = created_at', t);
        get diagnostics rc = row_count;
        if rc > 0 then problems := problems || format('%s was able to UPDATE %s', persona, t); end if;
      exception
        when insufficient_privilege then null;
        when others then problems := problems || format('%s UPDATE on %s was not blocked cleanly (%s)', persona, t, sqlerrm);
      end;

      begin
        execute format('delete from public.%I', t);
        get diagnostics rc = row_count;
        if rc > 0 then problems := problems || format('%s was able to DELETE from %s', persona, t); end if;
      exception
        when insufficient_privilege then null;
        when others then problems := problems || format('%s DELETE on %s was not blocked cleanly (%s)', persona, t, sqlerrm);
      end;
    end loop;

    begin
      insert into storage.objects (bucket_id, name) values ('awards-media', 'security-check.txt');
      problems := problems || format('%s was able to upload to storage', persona);
    exception
      when insufficient_privilege then null;
      when others then
        problems := problems || format('%s upload failed for another reason (%s) - check storage policies', persona, sqlerrm);
    end;

    execute 'reset role';
  end loop;

  perform set_config('request.jwt.claims', '', true);

  if array_length(problems, 1) > 0 then
    raise exception E'Security check FAILED:\n - %', array_to_string(problems, E'\n - ');
  end if;
end;
$$;

select 'All security checks passed' as result;
