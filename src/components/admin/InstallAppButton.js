"use client";

import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

// Chrome/Edge/Android fire `beforeinstallprompt`; iOS Safari doesn't, so there we show
// the "Share -> Add to Home Screen" hint instead.
export default function InstallAppButton() {
  const { t } = useAdminI18n();
  const [prompt, setPrompt] = useState(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (standalone) return;

    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) setIosHint(true);

    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (prompt) {
    return (
      <button
        onClick={async () => {
          prompt.prompt();
          await prompt.userChoice;
          setPrompt(null);
        }}
        className="flex items-center gap-3 px-4 py-3 text-sm text-[#e9ba0c] hover:bg-white/5 w-full cursor-pointer"
      >
        <FiDownload size={16} /> {t.nav.install}
      </button>
    );
  }

  if (iosHint) return <p className="px-4 py-2 text-[11px] text-white/45 leading-snug">{t.nav.iosHint}</p>;

  return null;
}
