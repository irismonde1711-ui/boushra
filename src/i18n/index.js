import fr from "./dictionaries/fr";
import en from "./dictionaries/en";

export * from "./config";

export const getDictionary = (lang) => (lang === "en" ? en : fr);

export const localizeCategory = (category, t) => ({ ...category, ...t.categories[category.slug] });

export const localizeService = (service, t) => ({ ...service, ...t.serviceItems[service.slug] });

// Products keep French as the source of truth; English fields are optional overrides.
export const localizeProduct = (product, lang) =>
  lang === "en"
    ? {
        ...product,
        name: product.nameEn || product.name,
        description: product.descriptionEn || product.description,
      }
    : product;
