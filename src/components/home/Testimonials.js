"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";
import { fetchAllReviews } from "@/lib/reviews";
import { useI18n } from "@/i18n/I18nProvider";

export default function Testimonials() {
  const { t, lang, href } = useI18n();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let active = true;
    fetchAllReviews({ limit: 6 })
      .then((items) => active && setReviews(items))
      .catch((err) => console.error("Failed to load reviews", err));
    return () => {
      active = false;
    };
  }, []);

  // Only real customer reviews — the section stays hidden until there are some.
  if (!reviews.length) return null;

  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading label={t.home.testiLabel} title={t.home.testiTitle} align="center" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {reviews.map((r) => (
            <figure key={r.id} className="bg-surface border border-gold/15 p-7 flex flex-col">
              <div className="flex gap-1 text-gold mb-5" aria-label={t.common.outOf5(r.rating)}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={14} className={i < r.rating ? "fill-current" : "opacity-25"} />
                ))}
              </div>
              <blockquote className="font-display italic text-lg leading-relaxed text-fg/90 flex-1">
                &ldquo;{r.comment}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{r.name}</span>
                {r.productSlug && (
                  <Link href={href(`/produit/${r.productSlug}`)} className="block text-xs text-muted hover:text-gold mt-1">
                    {(lang === "en" && r.productNameEn) || r.productName}
                  </Link>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
