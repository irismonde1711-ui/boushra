"use client";

import { createContext, useContext, useMemo } from "react";
import { getDictionary, localePath } from "./index";

const I18nContext = createContext(null);

// Only the locale string crosses the server/client boundary; the dictionary (which
// contains functions) is loaded on each side from the same module.
export function I18nProvider({ lang, children }) {
  const value = useMemo(
    () => ({ lang, t: getDictionary(lang), href: (path) => localePath(lang, path) }),
    [lang]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
