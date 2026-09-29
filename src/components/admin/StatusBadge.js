"use client";

import { useAdminI18n } from "@/i18n/AdminI18nProvider";

const ORDER_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-600",
};

const PAYMENT_STYLES = {
  cod: "bg-stone-100 text-stone-700",
  awaiting_verification: "bg-orange-100 text-orange-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }) {
  const { t } = useAdminI18n();
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 ${ORDER_STYLES[status] || ORDER_STYLES.pending}`}>
      {t.orderStatus[status] || status}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  const { t } = useAdminI18n();
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 ${PAYMENT_STYLES[status] || PAYMENT_STYLES.cod}`}>
      {t.paymentStatus[status] || status}
    </span>
  );
}
