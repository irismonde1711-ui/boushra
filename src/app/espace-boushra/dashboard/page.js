"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBox, FiShoppingBag, FiDollarSign, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { fetchAllProducts } from "@/lib/products";
import { fetchOrders } from "@/lib/orders";
import { formatFCFA, formatDate, shortOrderId } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_BASE } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

export default function DashboardOverview() {
  const { t, dict } = useAdminI18n();
  const o = t.overview;
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    Promise.all([fetchAllProducts(), fetchOrders()])
      .then(([p, list]) => {
        if (!active) return;
        setProducts(p);
        setOrders(list);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const pending = orders.filter((x) => x.status === "pending").length;
  const toVerify = orders.filter((x) => x.paymentStatus === "awaiting_verification").length;
  const revenue = orders.filter((x) => x.status === "delivered").reduce((s, x) => s + (x.total || 0), 0);
  const inStock = products.filter((p) => !p.sold).length;
  const loading = status === "loading";

  const stats = [
    { label: o.pending, value: pending, icon: FiShoppingBag, href: "commandes", alert: pending > 0 },
    { label: o.toVerify, value: toVerify, icon: FiAlertCircle, href: "commandes", alert: toVerify > 0 },
    { label: o.available, value: `${inStock} / ${products.length}`, icon: FiBox, href: "produits" },
    { label: o.revenue, value: formatFCFA(revenue), icon: FiDollarSign, href: "commandes" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{o.title}</h1>

      {status === "error" && <p className="text-danger text-sm mb-6">{o.loadError}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={`${ADMIN_BASE}/dashboard/${s.href}`}
            className={`bg-surface border p-5 sm:p-6 hover:border-gold transition-colors ${
              s.alert ? "border-gold" : "border-fg/10"
            }`}
          >
            <s.icon className="text-gold mb-4" size={20} />
            <p className="text-xl sm:text-2xl font-semibold">{loading ? "—" : s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-fg/10">
        <div className="flex items-center justify-between p-5 border-b border-fg/10">
          <h2 className="font-display text-xl">{o.recent}</h2>
          <Link href={`${ADMIN_BASE}/dashboard/commandes`} className="text-xs text-gold font-semibold flex items-center gap-1">
            {o.seeAll} <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-fg/10">
                <th className="p-4 font-medium">{o.colOrder}</th>
                <th className="p-4 font-medium">{o.colCustomer}</th>
                <th className="p-4 font-medium">{o.colTotal}</th>
                <th className="p-4 font-medium">{o.colPayment}</th>
                <th className="p-4 font-medium">{o.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((x) => (
                <tr key={x.id} className="border-b border-fg/10 last:border-none">
                  <td className="p-4">
                    <span className="font-mono text-xs">#{shortOrderId(x.id)}</span>
                    <span className="block text-[11px] text-muted">{formatDate(x.createdAt, true, dict.dateLocale)}</span>
                  </td>
                  <td className="p-4">{x.customer?.name}</td>
                  <td className="p-4 font-semibold">{formatFCFA(x.total)}</td>
                  <td className="p-4">
                    <PaymentStatusBadge status={x.paymentStatus} />
                  </td>
                  <td className="p-4">
                    <OrderStatusBadge status={x.status} />
                  </td>
                </tr>
              ))}
              {status === "ready" && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    {o.noOrders}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
