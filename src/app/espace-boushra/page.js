"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { loginAdmin, watchAuthState, checkIsAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { ADMIN_BASE, SITE } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const l = t.login;
  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsub = watchAuthState(async (user) => {
      if (user && (await checkIsAdmin())) router.replace(`${ADMIN_BASE}/dashboard`);
      else setChecking(false);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginAdmin(form.login, form.password);
      toast.success(l.welcome);
      router.replace(`${ADMIN_BASE}/dashboard`);
    } catch (err) {
      toast.error(err.code === "not_admin" ? l.notAdmin : l.badCredentials);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fg/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#090909] relative">
      <AdminLanguageSwitcher dark className="absolute top-5 right-5" />

      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image src={SITE.logo} alt={SITE.fullName} width={490} height={316} priority className="h-20 w-auto" />
        </div>

        <div className="bg-surface p-8 shadow-2xl">
          <h1 className="font-display text-3xl text-center">{l.title}</h1>
          <p className="text-muted text-sm text-center mt-2 mb-8">{l.subtitle}</p>

          {!isSupabaseConfigured ? (
            <p className="text-sm text-center text-danger">{l.notConfigured}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  placeholder={l.username}
                  aria-label={l.username}
                  value={form.login}
                  onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                  className="input pl-10"
                />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder={l.password}
                  aria-label={l.password}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? l.hidePassword : l.showPassword}
                  aria-pressed={showPassword}
                  title={showPassword ? l.hidePassword : l.showPassword}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-fg cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full">
                {submitting ? l.submitting : l.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
