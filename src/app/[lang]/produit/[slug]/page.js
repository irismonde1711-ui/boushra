import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductGrid from "@/components/products/ProductGrid";
import JsonLd from "@/components/ui/JsonLd";
import { fetchAllProducts, fetchProductBySlug } from "@/lib/products";
import { pageMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatFCFA } from "@/lib/format";
import { getDictionary, localePath, localizeProduct } from "@/i18n";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await fetchAllProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  try {
    const raw = await fetchProductBySlug(params.slug);
    if (!raw) return { title: t.meta.productNotFound };
    const product = localizeProduct(raw, params.lang);
    return pageMetadata({
      lang: params.lang,
      title: product.name,
      description: `${product.name} — ${formatFCFA(product.price)}. ${product.description}`.slice(0, 160),
      path: `/produit/${product.slug}`,
      image: product.images[0],
    });
  } catch {
    return { title: t.meta.product };
  }
}

export default async function ProductPage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  let raw = null;
  let related = [];
  try {
    raw = await fetchProductBySlug(params.slug);
    if (raw) {
      const all = await fetchAllProducts();
      related = all.filter((p) => p.id !== raw.id && p.category === raw.category && !p.sold).slice(0, 4);
    }
  } catch (err) {
    console.error("Failed to fetch product", err);
  }

  if (!raw) notFound();
  const product = localizeProduct(raw, lang);
  const category = t.categories[product.category];
  const categoryPath = `/categorie/${product.category}`;

  return (
    <div className="pt-28 sm:pt-32 pb-28">
      <JsonLd data={productJsonLd(product, lang)} />
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          { name: t.nav.home, path: "/" },
          ...(category ? [{ name: category.name, path: categoryPath }] : []),
          { name: product.name, path: `/produit/${product.slug}` },
        ])}
      />
      <div className="container-x">
        <nav aria-label={t.product.breadcrumb} className="text-xs text-muted mb-8 flex flex-wrap items-center gap-2">
          <Link href={localePath(lang, "/boutique")} className="hover:text-gold">
            {t.nav.shop}
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link href={localePath(lang, categoryPath)} className="hover:text-gold">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-fg/80">{product.name}</span>
        </nav>

        <ProductDetailClient product={raw} />

        {related.length > 0 && (
          <section className="mt-28">
            <div className="flex items-end justify-between gap-4 mb-10">
              <h2 className="font-display text-3xl sm:text-4xl">{t.product.related}</h2>
              {category && (
                <Link
                  href={localePath(lang, categoryPath)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-soft"
                >
                  {t.product.seeCategory}
                </Link>
              )}
            </div>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
