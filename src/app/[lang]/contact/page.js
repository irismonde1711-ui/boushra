import { FiMapPin, FiPhone, FiMail, FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ContactForm from "@/components/contact/ContactForm";
import { SITE, whatsappLink, mapsLink } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.contactTitle,
    description: t.meta.contactDescription(SITE.phones.map((p) => p.display).join(" / "), SITE.address.street),
    path: "/contact",
  });
}

export default function ContactPage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  const c = t.contact;

  return (
    <div className="pt-32 pb-28">
      <div className="container-x">
        <header className="max-w-3xl mb-16">
          <p className="label mb-4">{c.label}</p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
            {c.title[0]}
            <span className="italic gold-text">{c.title[1]}</span>
          </h1>
          <p className="text-muted mt-6 text-lg">{c.text}</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16">
          <div className="space-y-8">
            <a
              href={whatsappLink(t.whatsapp.hello)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto"
            >
              <FaWhatsapp size={17} /> {c.whatsapp}
            </a>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <FiMapPin className="text-gold mt-1 shrink-0" size={18} />
                <div>
                  <p className="field-label mb-1">{c.address}</p>
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                    {SITE.address.street}
                    <br />
                    {SITE.address.city}, {SITE.address.countryName[lang]}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <FiPhone className="text-gold mt-1 shrink-0" size={18} />
                <div>
                  <p className="field-label mb-1">{c.phone}</p>
                  {SITE.phones.map((p) => (
                    <a key={p.e164} href={`tel:${p.e164}`} className="block hover:text-gold">
                      {p.display}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex gap-4">
                <FiMail className="text-gold mt-1 shrink-0" size={18} />
                <div>
                  <p className="field-label mb-1">{c.email}</p>
                  <a href={`mailto:${SITE.email}`} className="hover:text-gold break-all">
                    {SITE.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <FiInstagram className="text-gold mt-1 shrink-0" size={18} />
                <div>
                  <p className="field-label mb-1">{c.instagram}</p>
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                    {SITE.instagramHandle}
                  </a>
                </div>
              </li>
            </ul>

            <div className="relative aspect-[4/3] border border-gold/20 overflow-hidden bg-surface">
              <iframe
                title={c.mapTitle}
                src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&hl=${lang}&output=embed`}
                className="absolute inset-0 w-full h-full grayscale-[60%] invert-[90%] hue-rotate-180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
