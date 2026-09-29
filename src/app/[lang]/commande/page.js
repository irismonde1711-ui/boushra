import CheckoutClient from "@/components/checkout/CheckoutClient";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.checkoutTitle,
    description: t.meta.checkoutDescription,
    path: "/commande",
    noindex: true,
  });
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
