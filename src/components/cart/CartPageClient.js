"use client";

import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useCartStore, cartSubtotal } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { formatFCFA } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

export default function CartPageClient() {
  const { t, href } = useI18n();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);

  return (
    <div className="pt-32 pb-28 min-h-[70vh]">
      <div className="container-x">
        <p className="label mb-4">{t.cart.pageLabel}</p>
        <h1 className="font-display text-5xl sm:text-6xl mb-12">{t.cart.pageTitle}</h1>

        {!hydrated ? null : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted mb-8">{t.cart.empty}</p>
            <Link href={href("/boutique")} className="btn-gold">
              {t.common.discoverShop}
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <ul className="lg:col-span-2 divide-y divide-fg/10 border-y border-fg/10">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 sm:gap-6 py-6">
                  <Link
                    href={href(`/produit/${item.slug}`)}
                    className="relative w-24 h-28 sm:w-28 sm:h-36 bg-surface2 shrink-0 overflow-hidden"
                  >
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={href(`/produit/${item.slug}`)} className="font-display text-lg sm:text-xl hover:text-gold">
                      {item.name}
                    </Link>
                    {item.option && <p className="text-sm text-muted mt-1">{item.option}</p>}
                    <p className="text-sm text-muted mt-1">
                      {formatFCFA(item.price)} {t.common.perUnit}
                    </p>
                    <div className="flex items-center justify-between mt-4 gap-3">
                      <div className="flex items-center border border-fg/15">
                        <button
                          onClick={() => decreaseQty(item.key)}
                          className="w-9 h-9 flex items-center justify-center cursor-pointer hover:text-gold"
                          aria-label={t.common.decreaseQty}
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => increaseQty(item.key)}
                          className="w-9 h-9 flex items-center justify-center cursor-pointer hover:text-gold"
                          aria-label={t.common.increaseQty}
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>
                      <span className="font-semibold text-gold">{formatFCFA(item.price * item.qty)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-muted hover:text-danger transition-colors cursor-pointer h-fit"
                    aria-label={t.common.removeItem}
                  >
                    <FiTrash2 size={17} />
                  </button>
                </li>
              ))}
            </ul>

            <aside className="bg-surface border border-gold/15 p-6 sm:p-8 h-fit">
              <h2 className="font-display text-2xl mb-6">{t.cart.summary}</h2>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted">{t.common.subtotal}</span>
                <span>{formatFCFA(cartSubtotal(items))}</span>
              </div>
              <div className="flex justify-between text-sm mb-6">
                <span className="text-muted">{t.common.delivery}</span>
                <span className="text-muted">{t.cart.deliveryLater}</span>
              </div>
              <Link href={href("/commande")} className="btn-gold w-full">
                {t.cart.checkout}
              </Link>
              <Link href={href("/boutique")} className="block text-center text-xs text-muted hover:text-gold mt-4">
                {t.common.continueShopping}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
