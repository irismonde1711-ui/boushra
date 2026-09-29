import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import JsonLd from "@/components/ui/JsonLd";
import { SERVICES, SITE, whatsappLink } from "@/config/site";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { getDictionary, localizeService } from "@/i18n";

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.servicesTitle,
    description: t.meta.servicesDescription,
    path: "/services",
    image: "/images/services/maquillage-2.webp",
  });
}

export default function ServicesPage({ params }) {
  const t = getDictionary(params.lang);
  const services = SERVICES.map((s) => localizeService(s, t));
  const [before, em] = t.services.title;

  return (
    <div className="pt-32 pb-28">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.name,
              description: s.description,
              image: absoluteUrl(s.images[0]),
              provider: { "@id": `${SITE.url}/#business` },
              areaServed: SITE.address.city,
            },
          })),
        }}
      />
      <div className="container-x">
        <header className="max-w-3xl mb-20">
          <p className="label mb-4">{t.services.label}</p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
            {before}
            <span className="italic gold-text">{em}</span>
          </h1>
          <p className="text-muted mt-6 text-lg leading-relaxed">{t.services.text}</p>
        </header>

        <div className="space-y-28">
          {services.map((s, idx) => (
            <section key={s.slug} id={s.slug} className="scroll-mt-28 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className={idx % 2 ? "lg:order-2" : ""}>
                <p className="label mb-4">0{idx + 1}</p>
                <h2 className="font-display text-4xl sm:text-5xl">{s.name}</h2>
                <p className="text-muted leading-relaxed mt-5 max-w-lg">{s.description}</p>
                <a
                  href={whatsappLink(t.whatsapp.service(s.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold mt-8"
                >
                  <FaWhatsapp size={16} />
                  {s.slug === "formation" ? t.services.enroll : t.services.book}
                </a>
              </div>

              <div className={`grid gap-3 ${s.images.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-md"}`}>
                {s.images.slice(0, 4).map((src, i) => (
                  <div
                    key={src}
                    className={`relative aspect-[4/5] overflow-hidden border border-gold/20 ${
                      s.images.length > 2 && i === 1 ? "mt-10" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={t.services.imgAlt(s.name)}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
