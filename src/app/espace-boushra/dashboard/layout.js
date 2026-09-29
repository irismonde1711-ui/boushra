"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { watchAuthState, checkIsAdmin, logoutAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAdminStore } from "@/store/useAdminStore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import { ADMIN_BASE } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const { user, authLoading, setUser } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace(ADMIN_BASE);
      return;
    }
    // Pages render only for signed-in admins; the database enforces the same rule
    // through RLS, so this guard is about UX, not security.
    const unsub = watchAuthState(async (u) => {
      if (u && (await checkIsAdmin())) {
        setUser(u);
      } else {
        if (u) await logoutAdmin();
        setUser(null);
        router.replace(ADMIN_BASE);
      }
    });
    return () => unsub();
  }, [router, setUser]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fg/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="lg:flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-14 flex items-center px-4 bg-surface border-b border-fg/10 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} aria-label={t.shell.openMenu} className="p-1 -ml-1">
            <FiMenu size={22} />
          </button>
          <span className="font-display text-lg ml-3 flex-1">{t.shell.mobileTitle}</span>
          <AdminLanguageSwitcher />
        </div>
        <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px]">{children}</div>
      </div>
    </div>
  );
}
