import { supabase, requireBackend, PAYMENT_PROOFS_BUCKET } from "./supabaseClient";

function mapOrder(row) {
  return {
    id: row.id,
    customer: row.customer || {},
    items: row.items || [],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentProofPath: row.payment_proof_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

// The bucket is private: shoppers can upload but never read back or list, so one
// customer can't see another's receipt. The random name makes paths unguessable.
export async function uploadPaymentProof(file) {
  requireBackend();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await supabase.storage.from(PAYMENT_PROOFS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function createOrder({ customer, items, paymentMethod, paymentProofPath }) {
  requireBackend();
  // Shoppers may INSERT orders but not SELECT them (admin-only), so the id is generated
  // here instead of read back. Totals, prices, statuses and dates are recomputed by the
  // prepare_order() trigger from the products table — whatever the browser sends there
  // is ignored.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("orders").insert({
    id,
    customer,
    items: items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      option: i.option || null,
      qty: i.qty,
      price: i.price,
      image: i.image,
    })),
    payment_method: paymentMethod,
    payment_proof_path: paymentProofPath || null,
  });
  if (error) throw error;
  return id;
}

export async function fetchOrders() {
  requireBackend();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function updateOrder(id, patch) {
  requireBackend();
  const row = {};
  if (patch.status) row.status = patch.status;
  if (patch.paymentStatus) row.payment_status = patch.paymentStatus;
  const { error } = await supabase.from("orders").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(order) {
  requireBackend();
  if (order.paymentProofPath) {
    await supabase.storage.from(PAYMENT_PROOFS_BUCKET).remove([order.paymentProofPath]);
  }
  const { error } = await supabase.from("orders").delete().eq("id", order.id);
  if (error) throw error;
}

export async function getPaymentProofUrl(path) {
  requireBackend();
  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(path, 60 * 30);
  if (error) throw error;
  return data.signedUrl;
}
