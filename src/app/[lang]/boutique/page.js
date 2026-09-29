import CategoryNav from "@/components/shop/CategoryNav";
import ShopClient from "@/components/shop/ShopClient";
import JsonLd from "@/components/ui/JsonLd";
import { fetchAllProducts } from "@/lib/products";
import { CATEGORIES } from "@/config/site";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getDictionary, localizeCategory } from "@/i18n";

export const revalidate = 60;

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.shopTitle,
    description: t.meta.shopDescription,
    path: "/boutique",
  });
}

export default async function BoutiquePage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  let products = [];
  let failed = false;
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error("Failed to load products", err);
    failed = true;
  }

  const categories = CATEGORIES.map((c) => ({
    ...localizeCategory(c, t),
    count: products.filter((p) => p.category === c.slug).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="pt-32 pb-28">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          { name: t.nav.home, path: "/" },
          { name: t.nav.shop, path: "/boutique" },
        ])}
      />
      <div className="container-x">
        <header className="mb-10">
          <p className="label mb-4">{t.shop.label}</p>
          <h1 className="font-display text-5xl sm:text-6xl leading-none">{t.shop.title}</h1>
          <p className="text-muted mt-5 max-w-2xl">{t.shop.text}</p>
        </header>

        <div className="mb-10">
          <CategoryNav categories={categories} total={products.length} lang={lang} />
        </div>

        {failed ? (
          <p className="text-muted py-20 text-center">{t.shop.unavailable}</p>
        ) : (
          <ShopClient products={products} grouped />
        )}
      </div>
    </div>
  );
}
