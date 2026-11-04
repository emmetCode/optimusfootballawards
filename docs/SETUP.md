# Setup

## 1. Run locally

```bash
npm install
cp .env.example .env.local     # then fill in your Supabase values
npm run dev
```

The site runs at http://localhost:3000. If that port is already in use, Vite will select the next available port and print its URL.

## 2. Create the Supabase project

1. Create a free project at https://supabase.com.
2. Open **Project Settings > API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Publishable key → `VITE_SUPABASE_PUBLISHABLE_KEY` (recommended). The legacy `anon` key can instead be set as `VITE_SUPABASE_ANON_KEY`.
   - Never copy the `service_role` key into this project.

## 3. Create the database

Open **SQL Editor** and run these files in order, pasting each one and pressing Run:

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0001_schema.sql` | Tables, constraints, indexes, triggers |
| 2 | `supabase/migrations/0002_seed_categories.sql` | The 10 award categories |
| 3 | `supabase/migrations/0003_rls_policies.sql` | Admin table, `is_admin()`, RLS policies |
| 4 | `supabase/migrations/0004_storage.sql` | `awards-media` bucket + storage policies |
| 5 | `supabase/migrations/0005_views.sql` | `published_winners` and `latest_published_season` views |
| 6 | `supabase/migrations/0006_pinned_latest_season.sql` | Makes a pinned season latest even before it has published winners |

Optional, for design work only: `supabase/seed/dev_placeholder.sql` (fake data, drafts only).

## 4. Create the first administrator

1. **Authentication > Providers > Email**: turn **off** "Allow new users to sign up".
2. **Authentication > Users > Add user**: create your email + password account.
3. Open `supabase/admin_bootstrap.sql`, replace `YOUR_EMAIL_HERE` with that email, run it in the SQL Editor.
4. The final query should show one row with your email.

Admin rights live in the `admins` table, which no website visitor can write to.

## 5. Quick security check

In the SQL Editor, confirm RLS is on for every table:

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

Every row should show `rowsecurity = true`.
