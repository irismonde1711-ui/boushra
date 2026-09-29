import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, option = null, qty = 1) => {
        const key = `${product.id}::${option || "-"}`;
        const items = get().items;
        const existing = items.find((i) => i.key === key);
        set({
          items: existing
            ? items.map((i) => (i.key === key ? { ...i, qty: Math.min(20, i.qty + qty) } : i))
            : [
                ...items,
                {
                  key,
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  image: product.images?.[0] || null,
                  option,
                  qty,
                },
              ],
          isOpen: true,
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      increaseQty: (key) =>
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, qty: Math.min(20, i.qty + 1) } : i)),
        }),

      decreaseQty: (key) =>
        set({
          items: get()
            .items.map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        }),

      clearCart: () => set({ items: [] }),

      // A saved cart can outlive the catalogue (item deleted, sold out, repriced). Drop
      // what can no longer be ordered, refresh the rest, and return the removed names.
      syncWithCatalog: (products) => {
        const byId = new Map(products.map((p) => [p.id, p]));
        const removed = [];
        const items = get().items.flatMap((i) => {
          const p = byId.get(i.productId);
          if (!p || p.sold) {
            removed.push(i.name);
            return [];
          }
          return [{ ...i, name: p.name, slug: p.slug, price: p.price, image: p.images?.[0] || i.image }];
        });
        set({ items });
        return removed;
      },
    }),
    {
      name: "boushra-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const cartCount = (items) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items) => items.reduce((sum, i) => sum + i.qty * i.price, 0);
