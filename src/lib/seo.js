import { SITE } from "@/config/site";
import { getDictionary, localePath } from "@/i18n";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

// `path` is the locale-neutral path ("/boutique"); canonical + hreflang are derived from it.
export function pageMetadata({ lang, title, description, path = "/", image, noindex = false }) {
  const t = getDictionary(lang);
  const img = absoluteUrl(image || SITE.ogImage);
  const url = localePath(lang, path);
  const fullTitle = title ? `${title} | ${SITE.name}` : t.meta.siteTitle;
  return {
    // Omitted (not undefined) on the homepage so the layout's default title applies.
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
      languages: { fr: localePath("fr", path), en: localePath("en", path), "x-default": localePath("fr", path) },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.fullName,
      locale: t.ogLocale,
      alternateLocale: [getDictionary(lang === "en" ? "fr" : "en").ogLocale],
      type: "website",
      images: [{ url: img }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [img] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function localBusinessJsonLd(lang) {
  const t = getDictionary(lang);
  return {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "Store"],
    "@id": `${SITE.url}/#business`,
    name: SITE.fullName,
    alternateName: SITE.name,
    description: t.meta.siteDescription,
    url: absoluteUrl(localePath(lang, "/")),
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl(SITE.ogImage),
    telephone: SITE.phones[0].e164,
    email: SITE.email,
    priceRange: "FCFA",
    currenciesAccepted: "XOF",
    paymentAccepted: "Cash, Bank transfer, Wave, Orange Money",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: { "@type": "Country", name: SITE.address.countryName[lang] },
    sameAs: [SITE.instagram],
  };
}

export function productJsonLd(product, lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => absoluteUrl(i)),
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(localePath(lang, `/produit/${product.slug}`)),
      priceCurrency: "XOF",
      price: product.price,
      availability: product.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@id": `${SITE.url}/#business` },
    },
  };
}

export function breadcrumbJsonLd(lang, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(localePath(lang, item.path)),
    })),
  };
}
