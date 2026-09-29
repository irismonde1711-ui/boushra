import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "./i18n/config";

// French pages live at the root (/boutique) and are served internally from /fr/...;
// English pages live under /en/... . The admin, API, Next internals and any file with
// an extension (images, sitemap.xml, manifest, service worker) are left untouched.
export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // /fr/... is an internal path — send visitors to the canonical unprefixed URL.
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  // Returning visitors who chose English land on the English version.
  if (req.cookies.get(LOCALE_COOKIE)?.value === "en") {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|espace-boushra|.*\\..*).*)"],
};
