"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiTruck, FiShield, FiCreditCard, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ReviewsSection from "./ReviewsSection";
import { useCartStore } from "@/store/useCartStore";
import { formatFCFA } from "@/lib/format";
import { whatsappLink } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeProduct } from "@/i18n";

const PERK_ICONS = [FiTruck, FiMapPin, FiCreditCard, FiShield];

export default function ProductDetailClient({ product: raw }) {
  const { t, lang, href } = useI18n();
  const product = localizeProduct(raw, lang);
  const [active, setActive] = useState(0);
  const [option, setOption] = useState(null);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const images = product.images || [];
  const needsOption = product.options.length > 0;
  const categoryName = t.categories[product.category]?.name;

  const handleAdd = () => {
    if (product.sold) return;
    if (needsOption && !option) {
      toast.error(t.product.chooseOptionError);
      return;
    }
    addItem(product, option, qty);
    toast.success(t.cart.added);
  };

  const waText = t.whatsapp.product(
    product.name,
    option,
    formatFCFA(product.price),
    absoluteUrl(href(`/produit/${product.slug}`))
  );

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-28 self-start">
          <div className="relative aspect-[4/5] bg-surface2 overflow-hidden border border-gold/15">
            {images[active] && (
              <Image
                src={images[active]}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            )}
            {product.sold && (
              <span className="absolute top-4 left-4 bg-bg/90 text-fg text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5">
                {t.common.soldOut}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden border cursor-pointer ${
                    i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={t.product.viewImage(i + 1)}
                >
                  <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {categoryName && <p className="label mb-4">{categoryName}</p>}
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05]">{product.name}</h1>
          <p className="font-display text-3xl text-gold mt-5">{formatFCFA(product.price)}</p>
          <p className={`text-sm mt-3 ${product.sold ? "text-danger" : "text-success"}`}>
            {product.sold ? t.product.soldOut : t.product.available}
          </p>

          <p className="text-muted leading-relaxed mt-8 max-w-xl whitespace-pre-line">{product.description}</p>

          {!product.sold && (
            <div className="mt-10 space-y-7">
              {needsOption && (
                <div>
                  <p className="field-label">{t.product.chooseOption}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setOption(o)}
                        className={`min-w-12 h-11 px-4 border text-sm transition-colors cursor-pointer ${
                          option === o ? "bg-gold text-ink border-gold" : "border-fg/20 hover:border-gold"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-fg/20 h-[52px] w-fit">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center cursor-pointer hover:text-gold"
                    aria-label={t.common.decreaseQty}
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-10 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="w-12 h-full flex items-center justify-center cursor-pointer hover:text-gold"
                    aria-label={t.common.increaseQty}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                <button onClick={handleAdd} className="btn-gold flex-1">
                  {t.product.addToCart}
                </button>
              </div>
            </div>
          )}

          <a href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full mt-3">
            <FaWhatsapp size={16} /> {product.sold ? t.product.restock : t.product.orderWhatsapp}
          </a>

          <ul className="grid sm:grid-cols-2 gap-5 mt-12 pt-8 border-t border-fg/10 text-sm">
            {t.product.perks.map(([title, text], i) => {
              const Icon = PERK_ICONS[i];
              return (
                <li key={title} className="flex gap-3">
                  <Icon className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-muted mt-0.5">{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-24">
        <ReviewsSection productId={product.id} />
      </div>
    </>
  );
}
