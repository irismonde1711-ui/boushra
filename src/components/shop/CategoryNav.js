import Link from "next/link";
import { getDictionary, localePath } from "@/i18n";

// Server-rendered chips (real links, so every category page is crawlable).
export default function CategoryNav({ categories, active = null, total, lang }) {
  const t = getDictionary(lang);
  const chip = (isActive) =>
    `shrink-0 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] border transition-colors ${
      isActive ? "bg-gold text-ink border-gold" : "border-fg/15 text-fg/80 hover:border-gold hover:text-gold"
    }`;

  return (
    <nav aria-label={t.shop.categoriesAria} className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      <Link href={localePath(lang, "/boutique")} className={chip(!active)}>
        {t.shop.all} <span className="opacity-60">({total})</span>
      </Link>
      {categories.map((c) => (
        <Link key={c.slug} href={localePath(lang, `/categorie/${c.slug}`)} className={chip(active === c.slug)}>
          {c.short} <span className="opacity-60">({c.count})</span>
        </Link>
      ))}
    </nav>
  );
}
