"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_COOKIE, localePath, stripLocale } from "@/i18n/config";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next) => {
    if (next === lang) return;
    // Remember the choice so the middleware sends returning visitors to it.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const target = localePath(next, stripLocale(pathname || "/"));
    router.push(`${target}${window.location.search}${window.location.hash}`);
  };

  return (
    <div role="group" aria-label={t.nav.language} className={`flex border border-gold/30 ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === lang}
          lang={l}
          className={`px-2.5 h-11 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
            l === lang ? "bg-gold text-ink" : "text-fg/70 hover:text-gold"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
