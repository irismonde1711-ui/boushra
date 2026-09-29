import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary, localePath } from "@/i18n";

// `categories` = localized config entries that have products, each with a `count`.
export default function CategoryGrid({ categories, lang }) {
  if (!categories.length) return null;
  const t = getDictionary(lang);

  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading label={t.home.catLabel} title={t.home.catTitle} />
          <Link href={localePath(lang, "/boutique")} className="btn-ghost self-start sm:self-auto">
            {t.home.catAll}
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={localePath(lang, `/categorie/${cat.slug}`)}
              className={`group relative overflow-hidden block bg-surface2 ${
                i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-[4/5]"
              }`}
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl sm:text-3xl text-white leading-tight">{cat.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold mt-1.5">{t.common.items(cat.count)}</p>
                </div>
                <span className="hidden sm:flex w-11 h-11 shrink-0 rounded-full border border-white/40 items-center justify-center text-white group-hover:bg-gold group-hover:border-gold group-hover:text-ink transition-colors">
                  <FiArrowUpRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
