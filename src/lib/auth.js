import { supabase, requireBackend } from "./supabaseClient";

// Being signed in is not enough: the account must also be listed in the `admins`
// table (checked by the is_admin() SQL function, which every RLS policy uses too).
export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

// Supabase logins are e-mail addresses; a plain username such as "admin" is mapped to
// "admin@boushra.local" (the same mapping is used by scripts/setup-supabase.mjs).
const ADMIN_LOGIN_DOMAIN = "boushra.local";
const toLoginEmail = (login) => {
  const value = login.trim().toLowerCase();
  return value.includes("@") ? value : `${value}@${ADMIN_LOGIN_DOMAIN}`;
};

export async function loginAdmin(login, password) {
  requireBackend();
  const { error } = await supabase.auth.signInWithPassword({ email: toLoginEmail(login), password });
  if (error) throw error;
  if (!(await checkIsAdmin())) {
    await supabase.auth.signOut();
    const err = new Error("Ce compte n'a pas accès à l'administration.");
    err.code = "not_admin";
    throw err;
  }
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) console.warn("Logout error:", error.message);
}

// Fires immediately with the current user, then on every sign-in/sign-out; returns a
// plain unsubscribe function.
export function watchAuthState(callback) {
  supabase.auth.getSession().then(({ data }) => callback(data.session?.user ?? null));
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
  return () => subscription.unsubscribe();
}
