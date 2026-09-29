"use client";

import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchReviewsForProduct, addReview } from "@/lib/reviews";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

const EMPTY = { name: "", rating: 5, comment: "" };

export default function ReviewsSection({ productId }) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchReviewsForProduct(productId)
      .then((items) => active && setReviews(items))
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.comment.trim().length < 3) {
      toast.error(t.reviews.invalid);
      return;
    }
    setSubmitting(true);
    try {
      await addReview({ productId, ...form });
      setReviews((r) => [{ ...form, id: `new-${Date.now()}`, createdAt: new Date().toISOString() }, ...r]);
      setForm(EMPTY);
      toast.success(t.reviews.thanks);
    } catch (err) {
      console.error(err);
      toast.error(t.reviews.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid lg:grid-cols-[1fr_1.1fr] gap-12" aria-labelledby="avis">
      <div>
        <h2 id="avis" className="font-display text-3xl sm:text-4xl">
          {t.reviews.title}
        </h2>
        {reviews.length > 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted mt-3">
            <FiStar className="fill-current text-gold" /> {t.reviews.summary(avg.toFixed(1), reviews.length)}
          </p>
        ) : (
          <p className="text-sm text-muted mt-3">{t.reviews.none}</p>
        )}

        {reviews.length > 0 && (
          <ul className="mt-8 space-y-6 max-h-[520px] overflow-y-auto pr-2" data-lenis-prevent>
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-fg/10 pb-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <div className="flex gap-0.5 text-gold" aria-label={t.common.outOf5(r.rating)}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={12} className={i < r.rating ? "fill-current" : "opacity-25"} />
                    ))}
                  </div>
                </div>
                {r.createdAt && <p className="text-[11px] text-muted mt-0.5">{formatDate(r.createdAt, false, t.dateLocale)}</p>}
                <p className="text-sm text-fg/80 leading-relaxed mt-2">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isSupabaseConfigured && (
        <form onSubmit={handleSubmit} className="bg-surface border border-gold/15 p-6 sm:p-8 space-y-5 h-fit">
          <h3 className="font-display text-2xl">{t.reviews.formTitle}</h3>
          <div>
            <p className="field-label">{t.reviews.rating}</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))}
                  className="cursor-pointer p-0.5"
                  aria-label={t.reviews.star(i + 1)}
                >
                  <FiStar size={24} className={i < form.rating ? "fill-current text-gold" : "text-fg/25"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-name" className="field-label">
              {t.reviews.name}
            </label>
            <input
              id="review-name"
              value={form.name}
              maxLength={60}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="review-comment" className="field-label">
              {t.reviews.comment}
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              className="input resize-none"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? t.reviews.sending : t.reviews.submit}
          </button>
        </form>
      )}
    </section>
  );
}
