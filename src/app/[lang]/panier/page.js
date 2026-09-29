import CartPageClient from "@/components/cart/CartPageClient";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.cartTitle,
    description: t.meta.cartDescription,
    path: "/panier",
    noindex: true,
  });
}

export default function CartPage() {
  return <CartPageClient />;
}
