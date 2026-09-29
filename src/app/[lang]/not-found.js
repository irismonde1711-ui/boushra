"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 text-center pt-20">
      <div>
        <p className="font-display text-8xl gold-text">404</p>
        <h1 className="font-display text-3xl mt-4">{t.notFound.title}</h1>
        <p className="text-muted mt-4">{t.notFound.text}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href={href("/")} className="btn-gold">
            {t.notFound.home}
          </Link>
          <Link href={href("/boutique")} className="btn-ghost">
            {t.notFound.shop}
          </Link>
        </div>
      </div>
    </div>
  );
}
