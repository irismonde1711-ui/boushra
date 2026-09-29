"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDictionary } from "./index";

const AdminI18nContext = createContext(null);
const STORAGE_KEY = "boushra-admin-lang";

// The admin is a client-only app, so its language is a per-device preference
// (localStorage) rather than part of the URL like on the public site.
export function AdminI18nProvider({ children }) {
  const [lang, setLangState] = useState("fr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = getDictionary(lang);
    return {
      lang,
      t: dict.admin,
      dict,
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      },
    };
  }, [lang]);

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminI18n must be used inside <AdminI18nProvider>");
  return ctx;
}
