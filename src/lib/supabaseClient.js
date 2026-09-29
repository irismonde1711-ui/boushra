import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Until the Supabase project is connected, the storefront runs on the bundled catalog
// (src/data/catalog.json) so the site can already be previewed; ordering, reviews and
// the admin area need the real backend and say so instead of failing silently.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// createClient throws synchronously on an empty URL, which would crash `next build`
// before the env vars exist — placeholders keep the module importable.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export const PRODUCT_IMAGES_BUCKET = "products";
export const PAYMENT_PROOFS_BUCKET = "payment-proofs";

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("La base de données n'est pas encore connectée.");
    this.name = "BackendNotConfiguredError";
  }
}

export function requireBackend() {
  if (!isSupabaseConfigured) throw new BackendNotConfiguredError();
}
