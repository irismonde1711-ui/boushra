"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { fetchAllProducts } from "@/lib/products";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeProduct } from "@/i18n";

// Runs once per visit (and on language change): reconciles the saved cart with the live
// catalogue so checkout never fails on an item that was deleted, sold out or repriced,
// and item names follow the current language.
export default function CartSync() {
  const { lang, t } = useI18n();

  useEffect(() => {
    const run = async () => {
      if (!useCartStore.getState().items.length) return;
      try {
        const products = (await fetchAllProducts()).map((p) => localizeProduct(p, lang));
        const removed = useCartStore.getState().syncWithCatalog(products);
        if (removed.length) toast(t.cart.removedUnavailable(removed.join(", ")), { duration: 6000 });
      } catch (err) {
        console.warn("Cart sync skipped:", err?.message);
      }
    };
    // Wait for the persisted cart to be restored from localStorage first.
    if (useCartStore.persist.hasHydrated()) run();
    else return useCartStore.persist.onFinishHydration(run);
  }, [lang, t]);

  return null;
}
