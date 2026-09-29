"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiStar, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchAllReviews, deleteReview } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { confirmDanger } from "@/lib/adminUi";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

export default function AdminReviewsPage() {
  const { t, dict, lang } = useAdminI18n();
  const r = t.reviews;
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");

  useEffect(() => {
    fetchAllReviews()
      .then((items) => {
        setReviews(items);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const productName = (review) => (lang === "en" && review.productNameEn) || review.productName;

  const handleDelete = async (review) => {
    const ok = await confirmDanger(r.deleteTitle, r.deleteText(review.name, productName(review) || r.aProduct), t.confirm);
    if (!ok) return;
    try {
      await deleteReview(review.id);
      setReviews((list) => list.filter((x) => x.id !== review.id));
      toast.success(r.deleted);
    } catch (err) {
      console.error(err);
      toast.error(t.deleteFailed);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(
      (x) =>
        (rating === "all" || x.rating === Number(rating)) &&
        (!q ||
          x.name?.toLowerCase().includes(q) ||
          x.comment?.toLowerCase().includes(q) ||
          x.productName?.toLowerCase().includes(q) ||
          x.productNameEn?.toLowerCase().includes(q))
    );
  }, [reviews, search, rating]);

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{r.title(reviews.length)}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={r.search} className="input pl-10" />
        </div>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="input sm:w-44 cursor-pointer">
          <option value="all">{r.allRatings}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {r.stars(n)}
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface animate-pulse" />
          ))}
        </div>
      )}
      {status === "error" && <p className="text-danger text-sm">{r.loadError}</p>}
      {status === "ready" && filtered.length === 0 && <p className="text-muted text-center py-16">{r.none}</p>}

      {status === "ready" && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((review) => (
            <li key={review.id} className="bg-surface border border-fg/10 p-4 sm:p-5 flex gap-4">
              <div className="relative w-12 h-14 bg-surface2 shrink-0 overflow-hidden">
                {review.productImage && <Image src={review.productImage} alt="" fill className="object-cover" sizes="48px" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-sm">{review.name}</span>
                  <span className="flex gap-0.5 text-gold" aria-label={dict.common.outOf5(review.rating)}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={12} className={i < review.rating ? "fill-current" : "opacity-25"} />
                    ))}
                  </span>
                  <span className="text-[11px] text-muted">{formatDate(review.createdAt, false, dict.dateLocale)}</span>
                </div>
                {review.productSlug ? (
                  <Link
                    href={`${lang === "en" ? "/en" : ""}/produit/${review.productSlug}`}
                    target="_blank"
                    className="text-xs text-gold hover:underline"
                  >
                    {productName(review)}
                  </Link>
                ) : (
                  <span className="text-xs text-muted">{r.deletedProduct}</span>
                )}
                <p className="text-sm text-fg/80 leading-relaxed mt-2">{review.comment}</p>
              </div>
              <button
                onClick={() => handleDelete(review)}
                className="text-muted hover:text-danger transition-colors cursor-pointer h-fit shrink-0"
                aria-label={r.deleteAria}
              >
                <FiTrash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
