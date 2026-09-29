"use client";

import { useAdminI18n } from "@/i18n/AdminI18nProvider";
import { LOCALES } from "@/i18n/config";

export default function AdminLanguageSwitcher({ dark = false, className = "" }) {
  const { lang, setLang, t } = useAdminI18n();
  return (
    <div
      role="group"
      aria-label={t.language}
      className={`inline-flex border ${dark ? "border-white/20" : "border-fg/15"} ${className}`}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors ${
            l === lang
              ? "bg-[#e9ba0c] text-black"
              : dark
              ? "text-white/60 hover:text-white"
              : "text-muted hover:text-fg"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
