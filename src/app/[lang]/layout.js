import { notFound } from "next/navigation";
import "../globals.css";
import { fontClasses } from "../fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import CartDrawer from "@/components/cart/CartDrawer";
import CartSync from "@/components/cart/CartSync";
import SmoothScroll from "@/components/ui/SmoothScroll";
import DemoBanner from "@/components/ui/DemoBanner";
import ToasterProvider from "@/components/ui/ToasterProvider";
import JsonLd from "@/components/ui/JsonLd";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALES, isLocale, getDictionary } from "@/i18n";
import { localBusinessJsonLd } from "@/lib/seo";
import { SITE } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.meta.siteTitle, template: `%s | ${SITE.name}` },
    description: t.meta.siteDescription,
    applicationName: SITE.fullName,
    keywords: t.meta.keywords,
    openGraph: {
      siteName: SITE.fullName,
      locale: t.ogLocale,
      type: "website",
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.fullName }],
    },
    twitter: { card: "summary_large_image", images: [SITE.ogImage] },
    formatDetection: { telephone: true },
  };
}

export const viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
};

export default function SiteLayout({ children, params }) {
  if (!isLocale(params.lang)) notFound();
  const { lang } = params;

  return (
    <html lang={lang} className={fontClasses}>
      <body className="font-body bg-bg text-fg antialiased">
        <I18nProvider lang={lang}>
          <ToasterProvider />
          <JsonLd data={localBusinessJsonLd(lang)} />
          <SmoothScroll />
          <Header />
          <CartDrawer />
          <CartSync />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
          <DemoBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
