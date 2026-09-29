"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { fetchProductById } from "@/lib/products";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

export default function EditProductPage() {
  const { id } = useParams();
  const { t } = useAdminI18n();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
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

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{t.form.editTitle}</h1>
      {status === "loading" && <div className="h-96 bg-surface animate-pulse" />}
      {status === "missing" && <p className="text-muted">{t.form.missing}</p>}
      {status === "error" && <p className="text-danger">{t.form.loadError}</p>}
      {status === "ready" && <ProductForm product={product} />}
    </div>
  );
}
