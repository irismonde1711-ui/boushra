import Hero from "@/components/home/Hero";
import PillarsMarquee from "@/components/home/PillarsMarquee";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesTeaser from "@/components/home/ServicesTeaser";
import BrandStory from "@/components/home/BrandStory";
import Testimonials from "@/components/home/Testimonials";
import VisitUs from "@/components/home/VisitUs";
import { fetchAllProducts } from "@/lib/products";
import { CATEGORIES } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { getDictionary, localizeCategory } from "@/i18n";

export const revalidate = 60;

export function generateMetadata({ params }) {
  return pageMetadata({ lang: params.lang, description: getDictionary(params.lang).meta.home, path: "/" });
}

export default async function HomePage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  let products = [];
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error("Failed to load products", err);
  }

  const categories = CATEGORIES.map((c) => {
    const inCat = products.filter((p) => p.category === c.slug);
    return { ...localizeCategory(c, t), count: inCat.length, image: c.image || inCat[0]?.images?.[0] || null };
  }).filter((c) => c.count > 0);

  const featured = products.filter((p) => p.featured && !p.sold).slice(0, 8);

  return (
    <>
      <Hero />
      <PillarsMarquee lang={lang} />
      <CategoryGrid categories={categories} lang={lang} />
      <FeaturedProducts products={featured.length ? featured : products.slice(0, 8)} lang={lang} />
      <ServicesTeaser lang={lang} />
      <BrandStory lang={lang} />
      <Testimonials />
      <VisitUs lang={lang} />
    </>
  );
}
