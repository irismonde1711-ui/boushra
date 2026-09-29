"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { fetchProductById } from "@/lib/products";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

// /espace-boushra/dashboard/produits/modifier?id=<uuid> — a query string rather than a
// /produits/<id> segment so the page also works as a single static file (GitHub Pages).
export default function EditProductPage() {
  const { t } = useAdminI18n();
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{t.form.editTitle}</h1>
      <Suspense fallback={<div className="h-96 bg-surface animate-pulse" />}>
        <EditProduct />
      </Suspense>
    </div>
  );
}

function EditProduct() {
  const id = useSearchParams().get("id");
  const { t } = useAdminI18n();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    if (!id) {
      setStatus("missing");
      return;
    }
    fetchProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setStatus(data ? "ready" : "missing");
      })
      .catch((err) => {
        console.error(err);
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") return <div className="h-96 bg-surface animate-pulse" />;
  if (status === "missing") return <p className="text-muted">{t.form.missing}</p>;
  if (status === "error") return <p className="text-danger">{t.form.loadError}</p>;
  return <ProductForm key={product.id} product={product} />;
}
