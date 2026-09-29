"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiCheck,
  FiX,
  FiExternalLink,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { fetchOrders, updateOrder, deleteOrder, getPaymentProofUrl } from "@/lib/orders";
import { formatFCFA, formatDate, shortOrderId } from "@/lib/format";
import { confirmDanger } from "@/lib/adminUi";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { ORDER_STATUS_KEYS, PAYMENT_STATUS_KEYS, PROOF_RETENTION_DAYS } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

const DAY = 24 * 60 * 60 * 1000;

function daysUntilDeletion(order) {
  if (!order.paymentProofPath || !order.createdAt) return null;
  const deleteAt = new Date(order.createdAt).getTime() + PROOF_RETENTION_DAYS * DAY;
  return Math.max(0, Math.ceil((deleteAt - Date.now()) / DAY));
}

const waNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 9 ? `221${digits}` : digits;
};

export default function AdminOrdersPage() {
  const { t } = useAdminI18n();
  const o = t.orders;
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      setOrders(await fetchOrders());
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (order, change, message) => {
    try {
      await updateOrder(order.id, change);
      setOrders((list) => list.map((x) => (x.id === order.id ? { ...x, ...change } : x)));
      toast.success(message);
    } catch (err) {
      console.error(err);
      toast.error(o.updateFailed);
    }
  };

  const handleDelete = async (order) => {
    const ok = await confirmDanger(
      o.deleteTitle(shortOrderId(order.id)),
      order.paymentProofPath ? o.deleteTextProof : o.deleteText,
      t.confirm
    );
    if (!ok) return;
    try {
      await deleteOrder(order);
      setOrders((list) => list.filter((x) => x.id !== order.id));
      toast.success(o.deleted);
    } catch (err) {
      console.error(err);
      toast.error(t.deleteFailed);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((x) => {
      if (statusFilter !== "all" && x.status !== statusFilter) return false;
      if (paymentFilter !== "all" && x.paymentStatus !== paymentFilter) return false;
      if (!q) return true;
      return (
        x.customer?.name?.toLowerCase().includes(q) ||
        x.customer?.phone?.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        shortOrderId(x.id).toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const toVerify = orders.filter((x) => x.paymentStatus === "awaiting_verification").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl sm:text-4xl">{o.title(orders.length)}</h1>
        <button onClick={load} className="btn-ghost !py-2.5 !px-4">
          <FiRefreshCw /> {o.refresh}
        </button>
      </div>
      <p className="text-sm text-muted mb-8 flex items-center gap-2">
        <FiClock className="text-gold shrink-0" />
        {o.retention(PROOF_RETENTION_DAYS)}
      </p>

      {toVerify > 0 && (
        <button
          onClick={() => setPaymentFilter("awaiting_verification")}
          className="w-full text-left bg-gold/10 border border-gold p-4 text-sm mb-6 cursor-pointer"
        >
          {o.toVerifyBanner(toVerify)}
        </button>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={o.search} className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input md:w-48 cursor-pointer">
          <option value="all">{o.allStatuses}</option>
          {ORDER_STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {t.orderStatus[k]}
            </option>
          ))}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input md:w-52 cursor-pointer">
          <option value="all">{o.allPayments}</option>
          {PAYMENT_STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {t.paymentStatus[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-fg/10 divide-y divide-fg/10">
        {status === "loading" &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="h-12 bg-surface2 animate-pulse" />
            </div>
          ))}
        {status === "error" && <p className="p-8 text-center text-danger">{o.loadError}</p>}
        {status === "ready" && filtered.length === 0 && <p className="p-10 text-center text-muted">{o.none}</p>}

        {status === "ready" &&
          filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              open={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onPatch={patch}
              onDelete={() => handleDelete(order)}
            />
          ))}
      </div>
    </div>
  );
}

function OrderRow({ order, open, onToggle, onPatch, onDelete }) {
  const { t, dict } = useAdminI18n();
  const o = t.orders;
  const daysLeft = daysUntilDeletion(order);
  const ref = shortOrderId(order.id);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
        <button onClick={onToggle} className="flex-1 min-w-[200px] text-left cursor-pointer flex items-center gap-3">
          {open ? <FiChevronUp className="shrink-0 text-muted" /> : <FiChevronDown className="shrink-0 text-muted" />}
          <span>
            <span className="font-semibold">{order.customer?.name}</span>
            <span className="block text-xs text-muted">
              <span className="font-mono">#{ref}</span> · {formatDate(order.createdAt, true, dict.dateLocale)}
            </span>
          </span>
        </button>
        <span className="font-semibold min-w-[110px]">{formatFCFA(order.total)}</span>
        <PaymentStatusBadge status={order.paymentStatus} />
        <select
          value={order.status}
          onChange={(e) => onPatch(order, { status: e.target.value }, o.statusUpdated(t.orderStatus[e.target.value]))}
          className="text-xs px-2.5 py-2 border border-fg/15 bg-surface cursor-pointer"
          aria-label={o.statusAria}
        >
          {ORDER_STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {t.orderStatus[k]}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="px-4 pb-6 pt-2 bg-surface2/60 grid lg:grid-cols-[1.3fr_1fr] gap-8">
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5 text-sm">
              <Info label={o.phone}>
                <a href={`tel:${order.customer?.phone}`} className="hover:text-gold">
                  {order.customer?.phone}
                </a>
                <a
                  href={`https://wa.me/${waNumber(order.customer?.phone)}?text=${encodeURIComponent(
                    o.waMessage(order.customer?.name, ref)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#1a9e55] font-semibold mt-1"
                >
                  <FaWhatsapp /> {o.writeWhatsapp}
                </a>
              </Info>
              <Info label={o.delivery}>
                {dict.checkout.zones[order.customer?.zone] || order.customer?.zone}
                {order.customer?.address && (
                  <span className="block text-muted">
                    {order.customer.address}, {order.customer.city}
                  </span>
                )}
              </Info>
              {order.customer?.notes && (
                <Info label={o.notes} className="sm:col-span-2">
                  {order.customer.notes}
                </Info>
              )}
            </div>

            <div>
              <p className="field-label">{o.items}</p>
              <ul className="divide-y divide-fg/10 border-y border-fg/10 text-sm">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4 py-2.5">
                    <span>
                      {item.name}
                      {item.option && <span className="text-muted"> — {item.option}</span>}
                      <span className="text-muted"> × {item.qty}</span>
                    </span>
                    <span className="shrink-0">{formatFCFA(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="text-sm mt-3 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted">{dict.common.subtotal}</dt>
                  <dd>{formatFCFA(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">{dict.common.delivery}</dt>
                  <dd>{formatFCFA(order.shipping)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>{dict.common.total}</dt>
                  <dd>{formatFCFA(order.total)}</dd>
                </div>
              </dl>
            </div>

            <button onClick={onDelete} className="text-xs text-danger flex items-center gap-1.5 cursor-pointer hover:underline">
              <FiTrash2 /> {o.deleteOrder}
            </button>
          </div>

          <div>
            <p className="field-label">
              {o.payment} — {dict.checkout.methods[order.paymentMethod]?.label}
            </p>
            {order.paymentMethod === "transfer" ? (
              <ProofPanel order={order} onPatch={onPatch} daysLeft={daysLeft} />
            ) : (
              <p className="text-sm text-muted">{o.codText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProofPanel({ order, onPatch, daysLeft }) {
  const { t } = useAdminI18n();
  const o = t.orders;
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!order.paymentProofPath) return;
    getPaymentProofUrl(order.paymentProofPath)
      .then((u) => active && setUrl(u))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [order.paymentProofPath]);

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-fg/10 p-3">
        {error && <p className="text-sm text-danger p-4">{o.proofMissing}</p>}
        {!error && !url && <div className="aspect-[3/4] max-h-80 bg-surface2 animate-pulse" />}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={o.proofAlt} className="w-full max-h-96 object-contain bg-surface2" />
            <span className="flex items-center justify-center gap-1 text-xs text-gold font-semibold mt-2">
              <FiExternalLink /> {o.openLarge}
            </span>
          </a>
        )}
      </div>

      <p className="text-xs text-muted">
        {o.compareBefore}
        <strong className="text-fg">{formatFCFA(order.total)}</strong>
        {o.compareAfter}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPatch(order, { paymentStatus: "verified" }, o.validated)}
          disabled={order.paymentStatus === "verified"}
          className="btn flex-1 !px-3 !py-3 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <FiCheck /> {o.validate}
        </button>
        <button
          onClick={() => onPatch(order, { paymentStatus: "rejected" }, o.rejected)}
          disabled={order.paymentStatus === "rejected"}
          className="btn flex-1 !px-3 !py-3 border border-danger text-danger hover:bg-danger hover:text-white"
        >
          <FiX /> {o.reject}
        </button>
      </div>

      {daysLeft !== null && (
        <p className="text-[11px] text-muted flex items-center gap-1.5">
          <FiClock /> {o.autoDelete(daysLeft)}
        </p>
      )}
    </div>
  );
}

function Info({ label, children, className = "" }) {
  return (
    <div className={className}>
      <p className="field-label mb-1">{label}</p>
      <div>{children}</div>
    </div>
  );
}
