import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductGrid from "@/components/products/ProductGrid";
import { getDictionary, localePath } from "@/i18n";

export default function FeaturedProducts({ products, lang }) {
  if (!products.length) return null;
  const t = getDictionary(lang);

  return (
    <section className="py-24 sm:py-32 bg-surface border-y border-gold/10">
      <div className="container-x">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading label={t.home.featLabel} title={t.home.featTitle} />
          <Link href={localePath(lang, "/boutique")} className="btn-ghost self-start sm:self-auto">
            {t.common.seeAll}
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
