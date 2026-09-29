"use client";

import Link from "next/link";
import Image from "next/image";
import { formatFCFA } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeProduct } from "@/i18n";

export default function ProductCard({ product: raw, priority = false }) {
  const { t, lang, href } = useI18n();
  const product = localizeProduct(raw, lang);
  const image = product.images?.[0];
  const category = t.categories[product.category];

  return (
    <Link href={href(`/produit/${product.slug}`)} className="group block">
      <div className="relative aspect-[4/5] bg-surface2 overflow-hidden">
        {product.sold && (
          <span className="absolute top-3 left-3 z-10 bg-bg/90 text-fg text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5">
            {t.common.soldOut}
          </span>
        )}
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              product.sold ? "opacity-60" : ""
            }`}
          />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-gold/0 group-hover:ring-gold/60 transition-all duration-500" />
      </div>
      <div className="pt-4">
        {category && <p className="text-[10px] uppercase tracking-[0.22em] text-muted mb-1">{category.short}</p>}
        <h3 className="font-display text-base sm:text-lg leading-snug text-fg group-hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gold font-semibold text-sm mt-1.5">{formatFCFA(product.price)}</p>
      </div>
    </Link>
  );
}
