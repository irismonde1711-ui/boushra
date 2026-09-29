"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useI18n } from "@/i18n/I18nProvider";

export default function DemoBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-gold text-ink text-[11px] sm:text-xs font-medium px-4 py-2 flex items-center justify-center gap-3 text-center">
      <span>{t.demo}</span>
      <button onClick={() => setDismissed(true)} className="shrink-0 cursor-pointer" aria-label={t.common.close}>
        <FiX size={14} />
      </button>
    </div>
  );
}
