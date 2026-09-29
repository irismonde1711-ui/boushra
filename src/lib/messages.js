import { supabase, requireBackend } from "./supabaseClient";

export async function submitContactMessage({ name, phone, email, message }) {
  requireBackend();
  const { error } = await supabase.from("messages").insert({
    name: name.trim(),
    phone: phone?.trim() || null,
    email: email?.trim() || null,
    message: message.trim(),
  });
  if (error) throw error;
}

export async function fetchMessages() {
  requireBackend();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((m) => ({ ...m, createdAt: m.created_at }));
}

export async function deleteMessage(id) {
  requireBackend();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}
