"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { FiArrowRight } from "react-icons/fi";
import { useI18n } from "@/i18n/I18nProvider";
import { SITE } from "@/config/site";

const TILES = [
  { src: "/images/produits/parure-plastron-doree.webp", className: "mt-16" },
  { src: "/images/services/maquillage-2.webp", className: "" },
  { src: "/images/produits/perruque-ondulee-noire.webp", className: "mt-28" },
];

export default function Hero() {
  const { t, href } = useI18n();
  const rootRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { autoAlpha: 1 });
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-line > span", { yPercent: 110, duration: 1.1, stagger: 0.1 })
        .from(".hero-fade", { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, "-=0.6")
        .from(".hero-tile", { y: 60, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.2);

      gsap.to(".hero-tile-inner", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="invisible relative overflow-hidden min-h-[100svh] pt-28 pb-16 lg:pb-24">
      <div
        aria-hidden
        className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full bg-gold/10 blur-[120px] pointer-events-none"
      />

      <div className="container-x relative grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
        <div>
          <p className="hero-fade label mb-6">{t.home.heroLabel}</p>
          <h1 className="font-display text-[13vw] sm:text-7xl xl:text-8xl leading-[0.98] tracking-tight">
            <span className="hero-line block overflow-hidden pb-1">
              <span className="block">{t.home.heroLine1}</span>
            </span>
            <span className="hero-line block overflow-hidden pb-2">
              <span className="block italic gold-text">{t.home.heroLine2}</span>
            </span>
          </h1>
          <p className="hero-fade text-muted text-base sm:text-lg leading-relaxed mt-7 max-w-lg">{t.home.heroText}</p>
          <div className="hero-fade flex flex-col sm:flex-row gap-3 mt-10">
            <Link href={href("/boutique")} className="btn-gold">
              {t.home.heroCta} <FiArrowRight />
            </Link>
            <Link href={href("/services")} className="btn-ghost">
              {t.home.heroCta2}
            </Link>
          </div>
          <dl className="hero-fade grid grid-cols-3 gap-6 mt-14 max-w-md border-t border-gold/20 pt-6">
            {t.home.heroStats.map(([title, text]) => (
              <div key={title}>
                <dt className="font-display text-xl text-gold">{title}</dt>
                <dd className="text-[11px] text-muted mt-1 leading-snug">{text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 -mx-1">
          {TILES.map((tile, i) => (
            <div key={tile.src} className={`hero-tile ${tile.className}`}>
              <div className="hero-tile-inner relative aspect-[4/5.6] overflow-hidden border border-gold/25">
                <Image
                  src={tile.src}
                  alt={t.home.heroAlts[i]}
                  fill
                  priority={i === 1}
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">{SITE.fullName}</p>
    </section>
  );
}
