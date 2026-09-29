"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useCartStore, cartCount, cartSubtotal } from "@/store/useCartStore";
import { formatFCFA } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

export default function CartDrawer() {
  const { t, href } = useI18n();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);

  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(panelRef.current, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "power3.out" });
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleClose() {
    gsap.to(panelRef.current, { xPercent: 100, duration: 0.35, ease: "power3.in" });
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3, onComplete: closeCart });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <div ref={overlayRef} onClick={handleClose} className="absolute inset-0 bg-black/70" />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-gold/20 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-fg/10">
          <h2 className="font-display text-2xl">
            {t.cart.title} <span className="text-gold">({cartCount(items)})</span>
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center cursor-pointer hover:text-gold"
            aria-label={t.cart.close}
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5">
              <p className="text-muted">{t.cart.empty}</p>
              <Link href={href("/boutique")} onClick={handleClose} className="btn-ghost">
                {t.common.discoverShop}
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="relative w-20 h-24 bg-surface2 shrink-0 overflow-hidden">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={href(`/produit/${item.slug}`)}
                      onClick={handleClose}
                      className="font-display text-base leading-snug hover:text-gold line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.option && <p className="text-xs text-muted mt-0.5">{item.option}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-fg/15">
                        <button
                          onClick={() => decreaseQty(item.key)}
                          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:text-gold"
                          aria-label={t.common.decreaseQty}
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => increaseQty(item.key)}
                          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:text-gold"
                          aria-label={t.common.increaseQty}
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gold">{formatFCFA(item.price * item.qty)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-muted hover:text-danger transition-colors cursor-pointer h-fit"
                    aria-label={t.common.removeItem}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-fg/10 px-6 py-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-[0.18em] text-muted">{t.common.subtotal}</span>
              <span className="font-display text-2xl text-gold">{formatFCFA(cartSubtotal(items))}</span>
            </div>
            <p className="text-xs text-muted">{t.cart.feesNote}</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href={href("/panier")} onClick={handleClose} className="btn-ghost !px-3">
                {t.cart.viewCart}
              </Link>
              <Link href={href("/commande")} onClick={handleClose} className="btn-gold !px-3">
                {t.cart.order}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
