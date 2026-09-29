import {
  supabase,
  isSupabaseConfigured,
  requireBackend,
  PRODUCT_IMAGES_BUCKET,
} from "./supabaseClient";
import catalog from "@/data/catalog.json";

function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: row.price,
    description: row.description || "",
    nameEn: row.name_en || "",
    descriptionEn: row.description_en || "",
    options: row.options || [],
    featured: row.featured,
    sold: row.sold,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

const demoProducts = () =>
  catalog.map(({ name_en, description_en, ...p }) => ({
    ...p,
    nameEn: name_en || "",
    descriptionEn: description_en || "",
    id: p.slug,
    createdAt: null,
  }));

export async function fetchAllProducts() {
  if (!isSupabaseConfigured) return demoProducts();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
}



export async function fetchProductBySlug(slug) {
  if (!isSupabaseConfigured) return demoProducts().find((p) => p.slug === slug) || null;
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return mapProduct(data);
}

export async function fetchProductById(id) {
  requireBackend();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return mapProduct(data);
}

function toRow(product) {
  const row = {};
  const fields = {
    name: "name",
    slug: "slug",
    category: "category",
    price: "price",
    description: "description",
    nameEn: "name_en",
    descriptionEn: "description_en",
    options: "options",
    featured: "featured",
    sold: "sold",
    images: "images",
  };
  for (const [key, column] of Object.entries(fields)) {
    if (product[key] !== undefined) row[column] = product[key];
  }
  return row;
}

export async function createProduct(product) {
  requireBackend();
  const { data, error } = await supabase.from("products").insert(toRow(product)).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function updateProduct(id, product) {
  requireBackend();
  const { error } = await supabase.from("products").update(toRow(product)).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id) {
  requireBackend();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file, folder) {
  requireBackend();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Images bundled with the site (/images/produits/...) aren't in Storage — only files
// uploaded through the dashboard are removed.
export async function deleteProductImage(url) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url?.indexOf(marker) ?? -1;
  if (idx === -1) return;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([decodeURIComponent(url.slice(idx + marker.length))]);
  if (error) console.warn("Could not delete storage image:", error.message);
}
