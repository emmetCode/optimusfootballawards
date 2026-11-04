// Pre-deployment safety check. Run with: npm run check  (after npm run build)
// Fails if a secret key could end up in the website, or if required deployment files are missing.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const problems = [];
const notes = [];

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(part, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function readEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
  return out;
}

// Same precedence Vite uses (later entries win).
const env = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.production"),
  ...readEnvFile(".env.local"),
  ...readEnvFile(".env.production.local"),
  ...Object.fromEntries(
    Object.entries(process.env).filter(([k]) => k.startsWith("VITE_")),
  ),
};

// 1. Any key configured for the build must be a public key.
function checkKey(name, value) {
  if (!value) return;
  if (value.startsWith("sb_secret_"))
    problems.push(
      `${name} is a Supabase SECRET key. Use the public anon/publishable key.`,
    );
  const payload = value.includes(".") ? decodeJwtPayload(value) : null;
  if (payload?.role === "service_role")
    problems.push(`${name} is the service_role key. Use the public anon key.`);
}
checkKey("VITE_SUPABASE_PUBLISHABLE_KEY", env.VITE_SUPABASE_PUBLISHABLE_KEY);
checkKey("VITE_SUPABASE_ANON_KEY", env.VITE_SUPABASE_ANON_KEY);

const publicKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!env.VITE_SUPABASE_URL || !publicKey) {
  const missing = [
    !env.VITE_SUPABASE_URL && "VITE_SUPABASE_URL",
    !publicKey &&
      "VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)",
  ].filter(Boolean);
  notes.push(
    `${missing.join(" and ")} not set in this shell. Set them in Cloudflare Pages before building there.`,
  );
} else if (
  !/^https:\/\/.+\.supabase\.(co|in)\/?$/.test(env.VITE_SUPABASE_URL) &&
  !/^https:\/\//.test(env.VITE_SUPABASE_URL)
) {
  problems.push("VITE_SUPABASE_URL should start with https://");
}

// 2. The built files must not contain any secret key.
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

if (!existsSync(DIST)) {
  problems.push("dist/ not found. Run npm run build first.");
} else {
  const jwtPattern =
    /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
  let scanned = 0;
  for (const file of walk(DIST)) {
    if (!/\.(js|css|html|map|json|txt)$/.test(file)) continue;
    scanned += 1;
    const text = readFileSync(file, "utf8");
    if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(text))
      problems.push(`Secret key found in ${file}`);
    for (const token of text.match(jwtPattern) ?? []) {
      if (decodeJwtPayload(token)?.role === "service_role")
        problems.push(`service_role key found in ${file}`);
    }
  }
  notes.push(`Scanned ${scanned} built files for secret keys.`);

  // 3. Required Cloudflare Pages files.
  for (const required of ["index.html", "_redirects", "_headers"]) {
    if (!existsSync(join(DIST, required)))
      problems.push(`dist/${required} is missing`);
  }
}

for (const note of notes) console.log(`note  ${note}`);
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  process.exit(1);
}
console.log("PASS  Pre-deployment checks passed.");
