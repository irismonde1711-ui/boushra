"use client";

import { FaWhatsapp } from "react-icons/fa";
import { whatsappLink } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

export default function WhatsAppFloat() {
  const { t } = useI18n();
  return (
    <a
      href={whatsappLink(t.whatsapp.info)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.float}
      className="fixed right-4 bottom-14 sm:right-6 sm:bottom-16 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-black/40 hover:scale-105 transition-transform"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
