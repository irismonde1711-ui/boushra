"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import ProductGrid from "@/components/products/ProductGrid";
import { CATEGORIES } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

const SORTS = {
  recent: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

// grouped=true (the shop page): one section per category until the shopper
// searches, then a single flat result list.
export default function ShopClient({ products, grouped = false }) {
  const { t, href } = useI18n();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [hideSold, setHideSold] = useState(false);

  const list = useMemo(() => {
    let items = products.filter((p) => !hideSold || !p.sold);
    const q = search.trim().toLowerCase();
    if (q) {
      // Match both languages so a search works whatever words the shopper uses.
      items = items.filter((p) =>
        [p.name, p.nameEn, p.description, p.descriptionEn].some((s) => s?.toLowerCase().includes(q))
      );
    }
    // Available items first, then the chosen order.
    const fn = SORTS[sort];
    return [...items].sort((a, b) => Number(a.sold) - Number(b.sold) || (fn ? fn(a, b) : 0));
  }, [products, search, sort, hideSold]);

  const searching = search.trim().length > 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-10">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.shop.search}
            aria-label={t.shop.search}
            className="input pl-11"
          />
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label={t.shop.sortAria}
            className="input w-auto cursor-pointer"
          >
            {Object.keys(SORTS).map((k) => (
              <option key={k} value={k}>
                {t.shop.sorts[k]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={hideSold}
              onChange={(e) => setHideSold(e.target.checked)}
              className="accent-[rgb(var(--c-gold))] w-4 h-4"
            />
            {t.shop.hideSold}
          </label>
        </div>
      </div>

      {list.length === 0 && <p className="text-muted text-center py-24">{t.shop.noResults}</p>}

      {list.length > 0 && (!grouped || searching) && (
        <>
          {searching && <p className="text-sm text-muted mb-6">{t.shop.results(list.length)}</p>}
          <ProductGrid products={list} priorityCount={4} />
        </>
      )}

      {list.length > 0 && grouped && !searching && (
        <div className="space-y-24">
          {CATEGORIES.map((cat) => {
            const items = list.filter((p) => p.category === cat.slug);
            if (!items.length) return null;
            const c = t.categories[cat.slug];
            return (
              <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
                <div className="flex items-end justify-between gap-4 mb-8 border-b border-gold/15 pb-5">
                  <div>
                    <h2 id={`cat-${cat.slug}`} className="font-display text-3xl sm:text-4xl">
                      {c.name}
                    </h2>
                    <p className="text-sm text-muted mt-2 max-w-xl hidden sm:block">{c.description}</p>
                  </div>
                  <Link
                    href={href(`/categorie/${cat.slug}`)}
                    className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-soft flex items-center gap-2"
                  >
                    {t.shop.seeAll(items.length)} <FiArrowRight />
                  </Link>
                </div>
                <ProductGrid products={items.slice(0, 8)} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
