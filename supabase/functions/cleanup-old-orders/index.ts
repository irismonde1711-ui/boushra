// Deletes orders that have a payment screenshot once they are older than 30 days,
// along with the screenshot itself, then sweeps receipts that were uploaded but never
// attached to an order (e.g. the shopper closed the page mid-checkout).
//
// Called once a day by pg_cron (see supabase/cron.sql). Deployed with JWT verification
// off and protected by the CLEANUP_SECRET bearer token instead.

import { createClient } from "npm:@supabase/supabase-js@2";

const RETENTION_DAYS = 30; // keep in sync with PROOF_RETENTION_DAYS in src/config/site.js
const BUCKET = "payment-proofs";
const BATCH = 200;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const secret = Deno.env.get("CLEANUP_SECRET");
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  let deletedOrders = 0;

  while (true) {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, payment_proof_path")
      .not("payment_proof_path", "is", null)
      .lt("created_at", cutoff.toISOString())
      .limit(BATCH);
    if (error) return json({ error: error.message, deletedOrders }, 500);
    if (!orders.length) break;

    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(orders.map((o) => o.payment_proof_path));
    if (removeError) return json({ error: removeError.message, deletedOrders }, 500);

    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .in("id", orders.map((o) => o.id));
    if (deleteError) return json({ error: deleteError.message, deletedOrders }, 500);

    deletedOrders += orders.length;
    if (orders.length < BATCH) break;
  }

  // Every order holding a receipt older than the cutoff is gone now, so any file still
  // older than the cutoff is an orphan. Receipts are stored under YYYY-MM/ folders.
  let deletedOrphans = 0;
  const { data: folders, error: listError } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (listError) return json({ error: listError.message, deletedOrders }, 500);

  for (const folder of folders.filter((f) => f.id === null)) {
    const { data: files } = await supabase.storage.from(BUCKET).list(folder.name, { limit: 1000 });
    const stale = (files || [])
      .filter((f) => f.id && f.created_at && new Date(f.created_at) < cutoff)
      .map((f) => `${folder.name}/${f.name}`);
    if (stale.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(stale);
      if (!error) deletedOrphans += stale.length;
    }
  }

  return json({ deletedOrders, deletedOrphans, cutoff: cutoff.toISOString() });
});
