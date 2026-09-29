import { FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE, whatsappLink, mapsLink } from "@/config/site";
import { getDictionary } from "@/i18n";

export default function VisitUs({ lang }) {
  const t = getDictionary(lang);
  const [before, em] = t.home.visitTitle;

  return (
    <section className="py-24 sm:py-28 relative overflow-hidden border-t border-gold/10">
      <div
        aria-hidden
        className="absolute -bottom-48 right-0 w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[120px] pointer-events-none"
      />
      <div className="container-x relative text-center max-w-3xl">
        <p className="label mb-5">{t.home.visitLabel}</p>
        <h2 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          {before}
          <span className="italic gold-text">{em}</span>
        </h2>
        <p className="text-muted mt-6 flex items-start sm:items-center justify-center gap-2">
          <FiMapPin className="text-gold shrink-0 mt-1 sm:mt-0" />
          {SITE.address.street}, {SITE.address.city}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a href={whatsappLink(t.whatsapp.booking)} target="_blank" rel="noopener noreferrer" className="btn-gold">
            <FaWhatsapp size={16} /> {t.home.visitBook}
          </a>
          <a href={`tel:${SITE.phones[0].e164}`} className="btn-ghost">
            <FiPhone /> {SITE.phones[0].display}
          </a>
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <FiMapPin /> {t.home.visitRoute}
          </a>
        </div>
      </div>
    </section>
  );
}
