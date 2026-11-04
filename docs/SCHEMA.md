# Database schema

Everything below is created by `supabase/migrations/0001` to `0006`. Never edit a migration that has already run;
add a new numbered file (for example `0006_…sql`) for any later change.

## Tables and relationships

```
seasons 1───* winner_records *───1 award_categories
                  │   │   │
                  │   │   └── person_id ──> people ──> countries
                  │   └────── team_id ────> clubs_teams ──> countries
                  └── photo_path (optional photo for that season)
```

| Table | Purpose | Key rules |
|---|---|---|
| `seasons` | Football seasons | `start_year` is unique and drives ordering. `label` (2024–25) is generated from it. At most one row can have `is_latest_override = true`. |
| `award_categories` | The awards | `slug` unique. `winner_type` is `player`, `coach` or `team`. `is_active` hides a category from the public page. New categories are just new rows. |
| `people` | Players and coaches | `role` is `player` or `coach`. Optional `photo_path` and `country_id`. |
| `clubs_teams` | Clubs and national teams | `kind` is `club` or `national_team`. Optional `logo_path` and `country_id`. |
| `countries` | Name and ISO code | Rows are created on demand when you pick a country. Flags are drawn as emoji from `iso_code`, so `flag_path` is unused. |
| `winner_records` | One winner per season and category | Unique on `(season_id, category_id)`. `status` is `draft` or `published`. `team_id` is stored per record so the club is correct for that season. |
| `admins` | Who is an administrator | Written only by `supabase/admin_bootstrap.sql`. No website user can write to it. |

A trigger on `winner_records` checks the winner matches the category: team awards need a team and no person;
player and coach awards need a person with the matching role. It also sets `published_at` automatically.
Every table has `created_at` and `updated_at` (kept current by a trigger).
Deleting a season, category, person or team that a winner uses is blocked (`on delete restrict`).

## Views used by the public site

| View | What it returns |
|---|---|
| `published_winners` | Published winners joined with season, category, person, team and country |
| `latest_published_season` | The pinned season, even if it has no published winners yet; without a pin, the newest season that has published winners |

Both use `security_invoker`, so row level security applies to the visitor, never to the view's owner.

## Access rules (row level security)

| | Visitors (anon) | Signed-in, not admin | Administrator |
|---|---|---|---|
| `seasons`, `award_categories`, `people`, `clubs_teams`, `countries` | read | read | read and write |
| `winner_records` | read **published only** | read published only | read and write everything |
| `admins` | nothing | nothing | read own row |
| Storage `awards-media` | view files by URL | view files by URL | list, upload, replace, delete |

Administrator status comes from `public.is_admin()`, which checks the `admins` table.
`supabase/verify_security.sql` tests all of the above and reports any gap.

## Storage

One public bucket, `awards-media`, 5 MB limit, JPG/PNG/WebP/SVG only. Folders: `people/`, `clubs/`, `heroes/`.
The database stores only paths (for example `people/3f2a….jpg`), never image data.
