"use client";

import Link from "next/link";
import Image from "next/image";
import { FiInstagram, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { CATEGORIES, SITE, SERVICES, whatsappLink, mapsLink } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

export default function Footer() {
  const { t, lang, href } = useI18n();

  return (
    <footer className="bg-surface border-t border-gold/15 pt-20 pb-24 sm:pb-12">
      <div className="container-x">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src={SITE.logo} alt={SITE.fullName} width={490} height={316} className="h-16 w-auto" />
            <p className="text-muted text-sm leading-relaxed mt-6 max-w-xs">{t.footer.about}</p>
            <div className="flex gap-3 mt-6">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-ink transition-colors"
              >
                <FiInstagram size={17} />
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-ink transition-colors"
              >
                <FaWhatsapp size={17} />
              </a>
            </div>
          </div>

          <div>
            <p className="label mb-5">{t.footer.shop}</p>
            <ul className="space-y-3 text-sm text-muted">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={href(`/categorie/${c.slug}`)} className="hover:text-gold transition-colors">
                    {t.categories[c.slug].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label mb-5">{t.footer.services}</p>
            <ul className="space-y-3 text-sm text-muted">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={href(`/services#${s.slug}`)} className="hover:text-gold transition-colors">
                    {t.serviceItems[s.slug].name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={href("/a-propos")} className="hover:text-gold transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href={href("/contact")} className="hover:text-gold transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label mb-5">{t.footer.findUs}</p>
            <ul className="space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <FiMapPin className="text-gold mt-0.5 shrink-0" />
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  {SITE.address.street}, {SITE.address.city}, {SITE.address.countryName[lang]}
                </a>
              </li>
              {SITE.phones.map((p) => (
                <li key={p.e164} className="flex gap-3">
                  <FiPhone className="text-gold mt-0.5 shrink-0" />
                  <a href={`tel:${p.e164}`} className="hover:text-gold">
                    {p.display}
                  </a>
                </li>
              ))}
              <li className="flex gap-3">
                <FiMail className="text-gold mt-0.5 shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-gold break-all">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-fg/10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted/70">
          <p>
            © {new Date().getFullYear()} {SITE.fullName}. {t.footer.rights}
          </p>
          <p>{t.footer.place}</p>
        </div>
      </div>
    </footer>
  );
}
