"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiPlusCircle,
  FiLogOut,
  FiX,
  FiStar,
  FiMessageSquare,
  FiExternalLink,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { logoutAdmin } from "@/lib/auth";
import { ADMIN_BASE, SITE } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";
import InstallAppButton from "./InstallAppButton";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";

const D = `${ADMIN_BASE}/dashboard`;
const LINKS = [
  { href: D, key: "overview", icon: FiGrid, exact: true },
  { href: `${D}/commandes`, key: "orders", icon: FiShoppingBag },
  { href: `${D}/produits`, key: "products", icon: FiBox, exact: true },
  { href: `${D}/produits/nouveau`, key: "addProduct", icon: FiPlusCircle },
  { href: `${D}/avis`, key: "reviews", icon: FiStar },
  { href: `${D}/messages`, key: "messages", icon: FiMessageSquare },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useAdminI18n();

  const handleLogout = async () => {
    await logoutAdmin();
    toast.success(t.nav.loggedOut);
    router.replace(ADMIN_BASE);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-[#0b0b0a] text-[#f5f0e6] flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Image src={SITE.logo} alt={SITE.name} width={490} height={316} className="h-10 w-auto" />
          <button onClick={onClose} className="lg:hidden text-white/60" aria-label={t.shell.closeMenu}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  active ? "bg-[#e9ba0c] text-black font-semibold" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} /> {t.nav[link.key]}
              </Link>
            );
          })}
          <a
            href={lang === "en" ? "/en" : "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/65 hover:bg-white/5 hover:text-white"
          >
            <FiExternalLink size={16} /> {t.nav.viewSite}
          </a>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="px-4 py-2 hidden lg:flex items-center justify-between">
            <span className="text-xs text-white/45">{t.language}</span>
            <AdminLanguageSwitcher dark />
          </div>
          <InstallAppButton />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/65 hover:text-[#e9ba0c] transition-colors w-full cursor-pointer"
          >
            <FiLogOut size={16} /> {t.nav.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
