# The Optimus Football Awards

A premium awards website: React + Vite on Cloudflare Pages, with Supabase (Postgres, Auth, Storage) as the backend.
Winners are managed from a protected admin dashboard, so no code or database editing is needed to update the site.

## Pages

| Route      | What it shows                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `/`        | Hero with the award photograph and a preview of the latest winners                              |
| `/about`   | The award categories                                                                            |
| `/seasons` | Season archive with a season selector and category filter                                       |
| `/latest`  | The latest season's published winners                                                           |
| `/admin`   | Protected dashboard: winners, seasons, categories, players and coaches, clubs and teams, images |

## Quick start

```bash
npm install
cp .env.example .env.local     # add your Supabase URL and public publishable key
npm run dev
```

## Scripts

| Command             | Does                                                           |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Local development server                                       |
| `npm run build`     | Production build into `dist/`                                  |
| `npm run check`     | Scans the build for secret keys and missing deployment files   |
| `npm run predeploy` | Build, then check                                              |
| `npm run deploy`    | Direct upload to Cloudflare Pages (needs `npx wrangler login`) |

## Documentation

- [docs/SETUP.md](docs/SETUP.md): Supabase project, database migrations, first admin, hero photo, admin guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Cloudflare Pages settings, production checklist, troubleshooting
- [docs/SCHEMA.md](docs/SCHEMA.md): tables, relationships, access rules

## Project structure

```
supabase/       SQL migrations, admin bootstrap, security check
scripts/        Pre-deployment safety check
public/         _redirects, _headers, robots.txt, favicon, flag font
src/
  lib/          Supabase client (public anon key only)
  services/     The only files that talk to Supabase
  hooks/        Data loading and UI hooks
  context/      Auth and toast state
  components/   layout, ui, awards (public), admin
  pages/        public and admin pages
  routes/       Route tables and the admin route guard
  styles/       Design tokens and stylesheets
  utils/        Small helpers (image URLs, flags, errors)
  constants/    Routes, config, country list
```

## Security in brief

Access is enforced by Supabase row level security and Storage policies, not by hiding buttons.
Visitors can read published winners only; only accounts listed in the `admins` table can change anything.
The website contains the public anon key only. Run `supabase/verify_security.sql` after any database change.
