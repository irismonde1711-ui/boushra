"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { useCartStore, cartCount } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useI18n } from "@/i18n/I18nProvider";
import { stripLocale } from "@/i18n/config";
import { CATEGORIES, SITE } from "@/config/site";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV = [
  { path: "/", key: "home" },
  { path: "/boutique", key: "shop" },
  { path: "/services", key: "services" },
  { path: "/a-propos", key: "about" },
  { path: "/contact", key: "contact" },
];

const isActive = (current, path) =>
  path === "/" ? current === "/" : current === path || current.startsWith(`${path}/`);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const current = stripLocale(pathname || "/");
  const { t, href } = useI18n();
  const hydrated = useHydrated();
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => cartCount(s.items));

  useEffect(() => {
    // Lenis drives scrolling from its own animation loop, so a plain "scroll" listener
    // can miss updates; a light poll reliably catches the single threshold we need.
    const check = () => setScrolled(window.scrollY > 24);
    check();
    const id = setInterval(check, 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? "bg-bg/90 backdrop-blur-md border-b border-gold/15" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-20">
        <Link href={href("/")} className="shrink-0" aria-label={`${SITE.fullName} — ${t.nav.homeAria}`}>
          <Image src={SITE.logo} alt={SITE.fullName} width={490} height={316} priority className="h-11 sm:h-12 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9" aria-label={t.nav.main}>
          {NAV.map((link) => (
            <Link
              key={link.path}
              href={href(link.path)}
              className={`relative text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors py-2 ${
                isActive(current, link.path) ? "text-gold" : "text-fg/80 hover:text-gold"
              }`}
            >
              {t.nav[link.key]}
              {isActive(current, link.path) && <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-gold" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            onClick={openCart}
            className="relative w-11 h-11 flex items-center justify-center border border-gold/30 text-fg hover:border-gold hover:text-gold transition-colors cursor-pointer"
            aria-label={t.nav.openCart}
          >
            <FiShoppingBag size={18} />
            {hydrated && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden w-11 h-11 flex items-center justify-center text-fg cursor-pointer"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden h-[calc(100dvh-5rem)] overflow-y-auto bg-bg border-t border-gold/15" aria-label={t.nav.mobile}>
          <div className="container-x py-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <span className="label">{t.nav.language}</span>
              <LanguageSwitcher />
            </div>
            {NAV.map((link) => (
              <Link
                key={link.path}
                href={href(link.path)}
                className={`font-display text-3xl py-3 ${isActive(current, link.path) ? "text-gold" : "text-fg"}`}
              >
                {t.nav[link.key]}
              </Link>
            ))}
            <p className="label mt-8 mb-3">{t.nav.categories}</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={href(`/categorie/${c.slug}`)}
                  className="text-sm text-muted hover:text-gold py-2 border-b border-fg/10"
                >
                  {t.categories[c.slug].short}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
