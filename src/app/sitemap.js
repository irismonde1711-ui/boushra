import { fetchAllProducts } from "@/lib/products";
import { CATEGORIES, SITE } from "@/config/site";
import { localePath } from "@/i18n/config";

export const revalidate = 3600;

// One entry per page and language, each pointing to its translation (hreflang).
const entry = (path, { lastModified = new Date(), changeFrequency, priority }) =>
  ["fr", "en"].map((lang) => ({
    url: `${SITE.url}${localePath(lang, path)}`,
    lastModified,
    changeFrequency,
    priority: lang === "fr" ? priority : Math.max(0.1, priority - 0.1),
    alternates: {
      languages: {
        fr: `${SITE.url}${localePath("fr", path)}`,
        en: `${SITE.url}${localePath("en", path)}`,
      },
    },
  }));

export default async function sitemap() {
  const pages = [
    ["/", "daily", 1],
    ["/boutique", "daily", 0.9],
    ["/services", "monthly", 0.8],
    ["/a-propos", "monthly", 0.6],
    ["/contact", "monthly", 0.7],
  ].flatMap(([path, changeFrequency, priority]) => entry(path, { changeFrequency, priority }));

  const categories = CATEGORIES.flatMap((c) =>
    entry(`/categorie/${c.slug}`, { changeFrequency: "weekly", priority: 0.7 })
  );

  let products = [];
  try {
    products = (await fetchAllProducts()).flatMap((p) =>
      entry(`/produit/${p.slug}`, {
        lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    );
  } catch (err) {
    console.error("sitemap: products unavailable", err);
  }

  return [...pages, ...categories, ...products];
}
