// Locale routing helpers — kept free of the dictionaries so middleware stays tiny.
// Server hosting (Vercel): French lives at the root (/boutique), English under /en.
// Static hosting (GitHub Pages, no middleware): both languages are prefixed (/fr, /en).

export const LOCALES = ["fr", "en"];
export const LOCALE_COOKIE = "NEXT_LOCALE";

const PREFIX_FRENCH = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export const isLocale = (value) => LOCALES.includes(value);

export function localePath(lang, path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang !== "en" && !PREFIX_FRENCH) return p;
  const prefix = lang === "en" ? "/en" : "/fr";
  return p === "/" ? prefix : `${prefix}${p}`;
}

// "/en/boutique" -> "/boutique", "/fr" -> "/", "/boutique" -> "/boutique"
export function stripLocale(pathname = "/") {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(3);
  }
  return pathname;
}
