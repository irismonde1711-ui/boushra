// One-command backend setup for Boushra.
//
//   npm run setup:supabase -- --token=sbp_xxx [--ref=abcd1234] [--admin-email=a@b.com --admin-password=...]
//
// (values can also come from env: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, ADMIN_EMAIL,
// ADMIN_PASSWORD, SUPABASE_ORG, SUPABASE_REGION). Without --ref a new "boushra" project is
// created. Every step is safe to re-run.
//
// Steps: project -> schema -> product photos to Storage + starter catalog -> sign-ups off ->
// admin account -> cleanup Edge Function + secret -> daily cron -> .env.local -> smoke test.
// Neither the access token nor the service_role key is written to disk.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const root = new URL("..", import.meta.url);
const file = (p) => new URL(p, root);

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...v] = a.slice(2).split("=");
      return [k, v.join("=")];
    })
);
const opt = (name, env) => args[name] || process.env[env] || "";

const TOKEN = opt("token", "SUPABASE_ACCESS_TOKEN");
let REF = opt("ref", "SUPABASE_PROJECT_REF");
// A plain username ("admin") becomes admin@boushra.local — same mapping as toLoginEmail()
// in src/lib/auth.js, so the client can log in by typing just "admin".
const ADMIN_LOGIN = opt("admin-email", "ADMIN_EMAIL").trim().toLowerCase();
const ADMIN_EMAIL = ADMIN_LOGIN && !ADMIN_LOGIN.includes("@") ? `${ADMIN_LOGIN}@boushra.local` : ADMIN_LOGIN;
const ADMIN_PASSWORD = opt("admin-password", "ADMIN_PASSWORD");
const ORG = opt("org", "SUPABASE_ORG");
const REGION = opt("region", "SUPABASE_REGION") || "eu-west-3"; // Paris — closest to Senegal

if (!TOKEN) {
  console.error("Missing access token: npm run setup:supabase -- --token=sbp_...");
  process.exit(1);
}

const API = "https://api.supabase.com/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = (msg) => console.log(`\n▸ ${msg}`);
const ok = (msg) => console.log(`  ✓ ${msg}`);

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> HTTP ${res.status}: ${data?.message || text}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const sql = (query) => api(`/projects/${REF}/database/query`, { method: "POST", body: { query } });

// ---------------------------------------------------------------- 1. project
step("Project");
if (!REF) {
  let org = ORG;
  if (!org) {
    const orgs = await api("/organizations");
    org = orgs[0]?.slug || orgs[0]?.id;
    if (!org) {
      const projects = await api("/projects");
      org = projects[0]?.organization_id;
    }
  }
  if (!org) throw new Error("No organization visible to this token; pass --org=<slug> or --ref=<project ref>.");
  const dbPass = randomBytes(18).toString("base64url");
  try {
    const created = await api("/projects", {
      method: "POST",
      body: { name: "boushra", organization_id: org, db_pass: dbPass, region: REGION },
    });
    REF = created.id || created.ref;
  } catch (err) {
    if (err.status === 403) {
      console.error(
        "\n  ✗ This token is not allowed to create projects in that organization.\n" +
          "    Either create the project in the Supabase dashboard and re-run with --ref=<ref>,\n" +
          "    or use a token from an Owner/Administrator of the organization."
      );
      process.exit(1);
    }
    throw err;
  }
  ok(`Created project ${REF} in ${REGION}`);
  console.log(`  Database password (save it in your password manager): ${dbPass}`);
}

for (let i = 0; ; i++) {
  const p = await api(`/projects/${REF}`);
  if (p.status === "ACTIVE_HEALTHY") {
    ok(`${p.name} (${REF}) is ready`);
    break;
  }
  if (i === 0) console.log(`  waiting for the project to be ready (status: ${p.status})…`);
  if (i > 90) throw new Error("Project not ready after 15 minutes");
  await sleep(10_000);
}
// The API can report healthy slightly before Postgres accepts queries.
for (let i = 0; ; i++) {
  try {
    await sql("select 1");
    break;
  } catch (err) {
    if (i > 30) throw err;
    await sleep(5_000);
  }
}

const URL_ = `https://${REF}.supabase.co`;
const keys = await api(`/projects/${REF}/api-keys?reveal=true`);
const ANON = keys.find((k) => k.name === "anon")?.api_key;
const SERVICE = keys.find((k) => k.name === "service_role")?.api_key;
if (!ANON || !SERVICE) throw new Error("Could not read the project's anon / service_role keys");
// Node < 22 has no built-in WebSocket, which supabase-js needs even when realtime is unused.
const clientOpts = { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws } };
const admin = createClient(URL_, SERVICE, clientOpts);

// ---------------------------------------------------------------- 2. schema
step("Tables, security rules, storage buckets");
await sql(readFileSync(file("supabase/schema.sql"), "utf8"));
await sleep(3000); // give the REST API a moment to reload its schema cache
ok("schema.sql applied");

// ---------------------------------------------------------------- 3. catalog
step("Product photos -> Supabase Storage, starter catalog");
const catalog = JSON.parse(readFileSync(file("src/data/catalog.json"), "utf8"));
const { data: existing } = await admin.from("products").select("slug, name_en, description_en");
const have = new Set((existing || []).map((p) => p.slug));

// Backfill English texts on starter products that don't have one yet (never overwrites
// what the admin typed).
let translated = 0;
for (const row of existing || []) {
  const src = catalog.find((p) => p.slug === row.slug);
  if (!src) continue;
  const patch = {};
  if (!row.name_en && src.name_en) patch.name_en = src.name_en;
  if (!row.description_en && src.description_en) patch.description_en = src.description_en;
  if (Object.keys(patch).length) {
    const { error } = await admin.from("products").update(patch).eq("slug", row.slug);
    if (error) throw new Error(`English backfill ${row.slug}: ${error.message}`);
    translated++;
  }
}
if (translated) ok(`English texts added to ${translated} existing products`);
const rows = [];
for (const [i, p] of catalog.entries()) {
  if (have.has(p.slug)) continue;
  const images = [];
  for (const img of p.images) {
    const local = file(`public${img}`);
    if (!existsSync(local)) throw new Error(`Missing image ${img}`);
    const path = `catalogue/${img.split("/").pop()}`;
    const { error } = await admin.storage
      .from("products")
      .upload(path, readFileSync(local), { contentType: "image/webp", cacheControl: "31536000", upsert: true });
    if (error) throw new Error(`Upload ${path}: ${error.message}`);
    images.push(admin.storage.from("products").getPublicUrl(path).data.publicUrl);
  }
  rows.push({
    name: p.name,
    name_en: p.name_en || null,
    slug: p.slug,
    category: p.category,
    price: p.price,
    description: p.description,
    description_en: p.description_en || null,
    options: p.options,
    featured: p.featured,
    sold: p.sold,
    images,
    created_at: new Date(Date.now() - i * 60_000).toISOString(),
  });
}
if (rows.length) {
  const { error } = await admin.from("products").insert(rows);
  if (error) throw new Error(`Insert products: ${error.message}`);
}
ok(`${rows.length} products added (${have.size} already there — left untouched)`);

// ---------------------------------------------------------------- 4. auth
step("Authentication");
await api(`/projects/${REF}/config/auth`, { method: "PATCH", body: { disable_signup: true } });
ok("Public sign-ups disabled (admins are created here or in the dashboard)");

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  let userId;
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (!error) {
    userId = data.user.id;
    ok(`Admin login created: ${ADMIN_EMAIL}`);
  } else {
    for (let page = 1; !userId && page < 50; page++) {
      const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      userId = list?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())?.id;
      if (!list?.users?.length) break;
    }
    if (!userId) throw new Error(`Could not create admin: ${error.message}`);
    await admin.auth.admin.updateUserById(userId, { password: ADMIN_PASSWORD });
    ok(`Admin login already existed — password updated: ${ADMIN_EMAIL}`);
  }
  const { error: adminErr } = await admin.from("admins").upsert({ user_id: userId });
  if (adminErr) throw new Error(`admins table: ${adminErr.message}`);
  ok("Added to the admins table");
} else {
  console.log("  (no --admin-email/--admin-password given: skipping admin account)");
}

// ---------------------------------------------------------------- 5. cleanup job
step("30-day cleanup of orders with payment screenshots");
const cleanupSecret = randomBytes(32).toString("hex");
await api(`/projects/${REF}/secrets`, {
  method: "POST",
  body: [{ name: "CLEANUP_SECRET", value: cleanupSecret }],
});
ok("CLEANUP_SECRET set");

const deploy = spawnSync(
  "npx",
  ["-y", "supabase@latest", "functions", "deploy", "cleanup-old-orders", "--project-ref", REF, "--use-api", "--no-verify-jwt"],
  { cwd: file("."), stdio: "inherit", shell: true, env: { ...process.env, SUPABASE_ACCESS_TOKEN: TOKEN } }
);
if (deploy.status !== 0) throw new Error("Edge Function deploy failed (see output above)");
ok("Edge Function cleanup-old-orders deployed");

await sql(
  readFileSync(file("supabase/cron.sql"), "utf8")
    .replaceAll("__PROJECT_REF__", REF)
    .replaceAll("__CLEANUP_SECRET__", cleanupSecret)
);
ok("Scheduled daily at 03:15 UTC");

const probe = await fetch(`${URL_}/functions/v1/cleanup-old-orders`, {
  method: "POST",
  headers: { Authorization: `Bearer ${cleanupSecret}` },
});
ok(`Test run: HTTP ${probe.status} ${await probe.text()}`);

// ---------------------------------------------------------------- 6. .env.local
step(".env.local");
const envPath = file(".env.local");
let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const setVar = (k, v) => {
  const line = `${k}=${v}`;
  env = new RegExp(`^${k}=.*$`, "m").test(env) ? env.replace(new RegExp(`^${k}=.*$`, "m"), line) : `${env.trimEnd()}\n${line}\n`;
};
setVar("NEXT_PUBLIC_SUPABASE_URL", URL_);
setVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", ANON);
writeFileSync(envPath, env);
ok("Supabase URL + anon key written (restart `npm run dev`)");

// ---------------------------------------------------------------- 7. smoke test
step("Smoke test as an anonymous visitor");
const anon = createClient(URL_, ANON, clientOpts);
const { count } = await anon.from("products").select("*", { count: "exact", head: true });
ok(`Visitors can read products: ${count}`);
const { data: leaked } = await anon.from("orders").select("id").limit(1);
ok(`Visitors cannot read orders: ${leaked?.length ? "✗ LEAK" : "0 rows visible"}`);
const { error: denied } = await anon.from("products").insert({ name: "x", slug: `x-${Date.now()}`, category: "bijoux", price: 1 });
ok(`Visitors cannot add products: ${denied ? "blocked" : "✗ ALLOWED"}`);

console.log(`\nDone. Dashboard: https://supabase.com/dashboard/project/${REF}\n`);
