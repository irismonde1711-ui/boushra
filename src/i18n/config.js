// Locale routing helpers — kept free of the dictionaries so middleware stays tiny.
// French is the default and lives at the root (/boutique); English lives under /en.

export const LOCALES = ["fr", "en"];
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (value) => LOCALES.includes(value);

export function localePath(lang, path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang !== "en") return p;
  return p === "/" ? "/en" : `/en${p}`;
}

// "/en/boutique" -> "/boutique", "/en" -> "/", "/boutique" -> "/boutique"
export function stripLocale(pathname = "/") {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}
