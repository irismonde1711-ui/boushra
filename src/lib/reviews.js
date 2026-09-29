import { supabase, isSupabaseConfigured, requireBackend } from "./supabaseClient";

function mapReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name,
    productNameEn: row.products?.name_en || "",
    productSlug: row.products?.slug,
    productImage: row.products?.images?.[0],
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function fetchReviewsForProduct(productId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapReview);
}

// Newest first across every product — the dashboard loads all, the homepage a few.
export async function fetchAllReviews({ limit } = {}) {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from("reviews")
    .select("*, products(name, name_en, slug, images)")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapReview);
}

export async function addReview({ productId, name, rating, comment }) {
  requireBackend();
  const { error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, name: name.trim(), rating, comment: comment.trim() });
  if (error) throw error;
}

export async function deleteReview(id) {
  requireBackend();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
