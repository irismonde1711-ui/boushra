import { notFound } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import CategoryNav from "@/components/shop/CategoryNav";
import ShopClient from "@/components/shop/ShopClient";
import JsonLd from "@/components/ui/JsonLd";
import { fetchAllProducts } from "@/lib/products";
import { CATEGORIES, categoryBySlug, whatsappLink } from "@/config/site";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { getDictionary, localePath, localizeCategory, localizeProduct } from "@/i18n";

export const revalidate = 60;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  const raw = categoryBySlug(params.slug);
  if (!raw) return { title: t.meta.categoryNotFound };
  const cat = localizeCategory(raw, t);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.categoryTitle(cat.name),
    description: t.meta.categoryDescription(cat.description),
    path: `/categorie/${cat.slug}`,
    image: cat.image || undefined,
  });
}

export default async function CategoryPage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  const raw = categoryBySlug(params.slug);
  if (!raw) notFound();
  const cat = localizeCategory(raw, t);

  let all = [];
  try {
    all = await fetchAllProducts();
  } catch (err) {
    console.error("Failed to load products", err);
  }
  const products = all.filter((p) => p.category === cat.slug);
  const categories = CATEGORIES.map((c) => ({
    ...localizeCategory(c, t),
    count: all.filter((p) => p.category === c.slug).length,
  })).filter((c) => c.count > 0 || c.slug === cat.slug);

  return (
    <div className="pt-32 pb-28">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          { name: t.nav.home, path: "/" },
          { name: t.nav.shop, path: "/boutique" },
          { name: cat.name, path: `/categorie/${cat.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: cat.name,
          description: cat.description,
          url: absoluteUrl(localePath(lang, `/categorie/${cat.slug}`)),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(localePath(lang, `/produit/${p.slug}`)),
              name: localizeProduct(p, lang).name,
            })),
          },
        }}
      />
      <div className="container-x">
        <header className="mb-10">
          <p className="label mb-4">{t.category.label}</p>
          <h1 className="font-display text-5xl sm:text-6xl leading-none">{cat.name}</h1>
          <p className="text-muted mt-5 max-w-2xl">{cat.description}</p>
        </header>

        <div className="mb-10">
          <CategoryNav categories={categories} active={cat.slug} total={all.length} lang={lang} />
        </div>

        {products.length ? (
          <ShopClient products={products} />
        ) : (
          <div className="border border-gold/20 bg-surface p-10 sm:p-14 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl">{t.category.emptyTitle}</h2>
            <p className="text-muted mt-4">{t.category.emptyText}</p>
            <a
              href={whatsappLink(t.whatsapp.category(cat.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-8"
            >
              <FaWhatsapp size={16} /> {t.category.emptyCta}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
