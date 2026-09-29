"use client";

import ProductForm from "@/components/admin/ProductForm";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

export default function NewProductPage() {
  const { t } = useAdminI18n();
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{t.form.newTitle}</h1>
      <ProductForm />
    </div>
  );
}
