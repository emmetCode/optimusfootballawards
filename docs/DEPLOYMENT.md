# Deployment: Cloudflare Pages + Supabase

The site is a static build (`dist/`), so Cloudflare Pages hosts it for free. All data lives in Supabase.

## 1. Settings you need

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |
| Node version | 20 (set by the `.node-version` file) |

Environment variables (Cloudflare Pages > your project > **Settings > Variables and Secrets**).
Add them for **both Production and Preview**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase **Project URL** |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** key (recommended; `VITE_SUPABASE_ANON_KEY` is also supported for legacy anon keys) |

Both values are public by design (they end up in the website). **Never** use the `service_role` or `sb_secret_…` key.
Vite reads these at build time, so after changing them you must redeploy.

## 2. Deploy with Git (recommended)

1. Push the project to GitHub (`.env.local` is git-ignored; check with `git status` before committing).
2. Cloudflare dashboard > **Workers & Pages > Create > Pages > Connect to Git**, and pick the repository.
3. Choose the **React (Vite)** preset (or enter the settings above), add the two environment variables, then **Save and Deploy**.
4. Every push to the main branch redeploys automatically. Other branches get their own preview URL.

## 3. Deploy without Git (direct upload)

```bash
npm run predeploy        # builds, then scans for secret keys and missing files
npx wrangler login       # first time only
npm run deploy           # uploads dist/ (edit the project name in package.json if you used another)
```

Build with `VITE_SUPABASE_URL` and either `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` set in your shell or `.env.local`.

## 4. Supabase settings for production

1. **Authentication > URL Configuration**: set **Site URL** to your live address
   (for example `https://optimus-football-awards.pages.dev` or your custom domain).
2. **Authentication > Providers > Email**: keep "Allow new users to sign up" **off**.
3. **SQL Editor**: run `supabase/verify_security.sql`. You should see "All security checks passed".
   Run it again after any database change, and after adding your first season and person so every test is exercised.
4. **Storage**: the `awards-media` bucket should be public with a 5 MB limit (created by migration 0004).
5. Keep a copy of your data. Free Supabase projects do not include downloadable backups, so export your tables
   (Table Editor > Export as CSV) from time to time. Also check Supabase's current terms: free projects have been
   paused after about a week without activity. Visitors count as activity, but a quiet site may need un-pausing
   from the Supabase dashboard.

## 5. Custom domain

Cloudflare Pages > your project > **Custom domains > Set up a domain**. Afterwards, update the Supabase **Site URL**
(step 4.1) to the new address.

## 6. Included deployment files

| File | Purpose |
|---|---|
| `public/_redirects` | Makes page refreshes and deep links (such as `/seasons`) work on a single-page app |
| `public/_headers` | Security headers, long caching for hashed assets, and `noindex` for `/admin` |
| `public/robots.txt` | Asks search engines to skip `/admin` |
| `.node-version` | Pins Node 20 for Cloudflare builds |
| `scripts/predeploy-check.mjs` | Fails if a secret key is configured or found in the build |

### Content Security Policy

`_headers` sends the policy as **Content-Security-Policy-Report-Only**, so it cannot break the site.
After your first deploy, open the public pages and `/admin` with the browser console open (F12).
If there are no "Content Security Policy" warnings, edit `public/_headers`, change
`Content-Security-Policy-Report-Only` to `Content-Security-Policy`, and redeploy to enforce it.
If you use a custom Supabase domain, add it to `img-src` and `connect-src`.

## 7. After the first deploy: checklist

- [ ] Home, `/about`, `/seasons`, `/latest` load; refreshing `/seasons` does not give a 404.
- [ ] `/admin/login` signs you in; the dashboard shows counts.
- [ ] Upload the hero photograph (Admin > Images) and confirm it appears on the home page.
- [ ] Add one test winner, publish it, see it on `/latest`, then delete it.
- [ ] `supabase/verify_security.sql` reports "All security checks passed".
- [ ] No Content Security Policy warnings in the console, then enforce the policy.

## 8. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Blank white page | Environment variables missing at build time. Add them in Cloudflare and redeploy. |
| 404 when refreshing a page | `_redirects` missing from `dist/`. Run `npm run check` locally. |
| Winners or images missing | The record is still a draft, or the image path/bucket is wrong. |
| "does not have administrator access" | Run `supabase/admin_bootstrap.sql` with that account's email. |
| Images show on the site but not in admin (or the reverse) | Check the bucket is public and the storage policies from migration 0004 exist. |
