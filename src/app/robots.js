import { SITE } from "@/config/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin area is deliberately not listed: naming its URL in a public file would
        // advertise it. Its pages carry their own noindex tag instead.
        disallow: ["/panier", "/commande"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
