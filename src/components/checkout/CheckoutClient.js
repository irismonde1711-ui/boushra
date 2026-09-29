"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiCheck, FiUploadCloud, FiX, FiTruck, FiCreditCard, FiCopy } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCartStore, cartSubtotal } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { createOrder, uploadPaymentProof, MAX_PROOF_BYTES } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { formatFCFA, shortOrderId } from "@/lib/format";
import { DELIVERY_ZONES, PAYMENT_METHOD_IDS, PAYMENT_ACCOUNTS, whatsappLink } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

const EMPTY_FORM = { name: "", phone: "", zone: "mbour", address: "", city: "Mbour", notes: "" };

export default function CheckoutClient() {
  const { t, href } = useI18n();
  const c = t.checkout;
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [form, setForm] = useState(EMPTY_FORM);
  const [method, setMethod] = useState("cod");
  const [proof, setProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const zone = DELIVERY_ZONES.find((z) => z.id === form.zone) || DELIVERY_ZONES[0];
  const subtotal = cartSubtotal(items);
  const total = subtotal + zone.fee;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!proof) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proof);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proof]);

  const errors = useMemo(() => {
    const e = {};
    if (form.name.trim().length < 2) e.name = c.errors.name;
    if (form.phone.replace(/\D/g, "").length < 9) e.phone = c.errors.phone;
    if (zone.needsAddress && form.address.trim().length < 4) e.address = c.errors.address;
    if (zone.needsAddress && form.city.trim().length < 2) e.city = c.errors.city;
    if (method === "transfer" && !proof) e.proof = c.errors.proof;
    return e;
  }, [form, zone, method, proof, c]);

  const handleProof = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(c.proofNotImage);
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      toast.error(c.proofTooBig);
      return;
    }
    setProof(file);
  };

  const copy = (value) => {
    navigator.clipboard?.writeText(value).then(() => toast.success(t.common.copied));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const first = Object.values(errors)[0];
    if (first) {
      toast.error(first);
      return;
    }
    setSubmitting(true);
    try {
      const proofPath = method === "transfer" ? await uploadPaymentProof(proof) : null;
      const orderId = await createOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          zone: form.zone,
          address: zone.needsAddress ? form.address.trim() : "",
          city: zone.needsAddress ? form.city.trim() : "Mbour",
          notes: form.notes.trim(),
        },
        items,
        paymentMethod: method,
        paymentProofPath: proofPath,
      });
      setDone({ orderId, total, method, name: form.name.trim() });
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      toast.error(/épuisé|introuvable/i.test(err?.message || "") ? c.unavailableItem : c.failed);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="min-h-screen" />;

  if (done) {
    const ref = shortOrderId(done.orderId);
    return (
      <div className="pt-36 pb-28 min-h-[80vh]">
        <div className="container-x max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-gold text-ink flex items-center justify-center mx-auto">
            <FiCheck size={30} />
          </div>
          <p className="label mt-8 mb-4">{c.doneLabel}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{c.thanks(done.name.split(" ")[0])}</h1>
          <p className="text-muted mt-6 leading-relaxed">
            {c.doneOrder} <span className="text-gold font-semibold">#{ref}</span> {c.doneAmount}{" "}
            <span className="text-fg font-semibold">{formatFCFA(done.total)}</span> {c.doneReceived}{" "}
            {done.method === "transfer" ? c.doneTransfer : c.doneCod}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a
              href={whatsappLink(t.whatsapp.orderPlaced(ref))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <FaWhatsapp size={16} /> {c.notifyWhatsapp}
            </a>
            <Link href={href("/boutique")} className="btn-ghost">
              {t.common.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-28 min-h-[70vh]">
        <div className="container-x text-center py-16">
          <p className="text-muted mb-8">{c.emptyCart}</p>
          <Link href={href("/boutique")} className="btn-gold">
            {t.common.discoverShop}
          </Link>
        </div>
      </div>
    );
  }

  const StepTitle = ({ n, children }) => (
    <legend className="font-display text-2xl mb-6 flex items-center gap-3">
      <span className="w-8 h-8 rounded-full border border-gold text-gold text-sm font-body flex items-center justify-center">
        {n}
      </span>
      {children}
    </legend>
  );

  return (
    <div className="pt-32 pb-28">
      <div className="container-x">
        <p className="label mb-4">{c.label}</p>
        <h1 className="font-display text-5xl sm:text-6xl mb-12">{c.title}</h1>

        {!isSupabaseConfigured && (
          <div className="border border-gold/40 bg-gold/10 p-5 text-sm mb-10">
            {c.offline[0]}
            <a href={whatsappLink(t.whatsapp.order)} className="text-gold underline">
              {c.offline[1]}
            </a>
            {c.offline[2]}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14">
          <div className="space-y-12">
            <fieldset>
              <StepTitle n={1}>{c.step1}</StepTitle>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={c.name} id="name">
                  <input id="name" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
                </Field>
                <Field label={c.phone} id="phone">
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="77 000 00 00"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
            </fieldset>

            <fieldset>
              <StepTitle n={2}>{c.step2}</StepTitle>
              <div className="space-y-3">
                {DELIVERY_ZONES.map((z) => (
                  <label
                    key={z.id}
                    className={`flex items-center justify-between gap-4 border p-4 cursor-pointer transition-colors ${
                      form.zone === z.id ? "border-gold bg-gold/5" : "border-fg/15 hover:border-fg/30"
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="zone"
                        value={z.id}
                        checked={form.zone === z.id}
                        onChange={() => update("zone", z.id)}
                        className="accent-[rgb(var(--c-gold))] w-4 h-4"
                      />
                      {c.zones[z.id]}
                    </span>
                    <span className="text-sm font-semibold text-gold shrink-0">{z.fee ? formatFCFA(z.fee) : t.common.free}</span>
                  </label>
                ))}
              </div>

              {zone.needsAddress && (
                <div className="grid sm:grid-cols-[2fr_1fr] gap-5 mt-6">
                  <Field label={c.address} id="address">
                    <input
                      id="address"
                      autoComplete="street-address"
                      placeholder={c.addressPh}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label={c.city} id="city">
                    <input id="city" autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} className="input" />
                  </Field>
                </div>
              )}
              <div className="mt-5">
                <Field label={c.notes} id="notes">
                  <textarea
                    id="notes"
                    rows={3}
                    maxLength={500}
                    placeholder={c.notesPh}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="input resize-none"
                  />
                </Field>
              </div>
            </fieldset>

            <fieldset>
              <StepTitle n={3}>{c.step3}</StepTitle>
              <div className="grid sm:grid-cols-2 gap-3">
                {PAYMENT_METHOD_IDS.map((id) => (
                  <label
                    key={id}
                    className={`border p-5 cursor-pointer transition-colors ${
                      method === id ? "border-gold bg-gold/5" : "border-fg/15 hover:border-fg/30"
                    }`}
                  >
                    <span className="flex items-center gap-3 font-semibold text-sm">
                      <input
                        type="radio"
                        name="method"
                        value={id}
                        checked={method === id}
                        onChange={() => setMethod(id)}
                        className="accent-[rgb(var(--c-gold))] w-4 h-4"
                      />
                      {id === "cod" ? <FiTruck className="text-gold" /> : <FiCreditCard className="text-gold" />}
                      {c.methods[id].label}
                    </span>
                    <span className="block text-xs text-muted mt-2 leading-relaxed">{c.methods[id].hint}</span>
                  </label>
                ))}
              </div>

              {method === "transfer" && (
                <div className="mt-6 border border-gold/25 bg-surface p-5 sm:p-6 space-y-6">
                  <p className="text-sm">
                    {c.sendBefore}
                    <span className="text-gold font-semibold">{formatFCFA(total)}</span>
                    {c.sendAfter}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {PAYMENT_ACCOUNTS.map((acc) => (
                      <div key={acc.id} className="border border-fg/10 p-4">
                        <p className="label mb-3 tracking-[0.18em]">{c.accounts[acc.id]}</p>
                        <dl className="space-y-2 text-xs">
                          {acc.rows.map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-muted">{c.fields[k]}</dt>
                              <dd className="flex items-center justify-between gap-2 font-medium break-all">
                                {v}
                                <button
                                  type="button"
                                  onClick={() => copy(v)}
                                  className="text-muted hover:text-gold cursor-pointer shrink-0"
                                  aria-label={t.common.copy(c.fields[k])}
                                >
                                  <FiCopy size={12} />
                                </button>
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="field-label">{c.proofLabel}</p>
                    {proofPreview ? (
                      <div className="flex items-start gap-4">
                        <div className="relative w-28 h-40 border border-gold/40 overflow-hidden bg-surface2">
                          <Image src={proofPreview} alt={c.proofAlt} fill unoptimized className="object-cover" />
                        </div>
                        <div className="text-xs text-muted space-y-2">
                          <p className="text-fg break-all">{proof.name}</p>
                          <button
                            type="button"
                            onClick={() => setProof(null)}
                            className="flex items-center gap-1 hover:text-danger cursor-pointer"
                          >
                            <FiX /> {c.proofChange}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-fg/20 hover:border-gold py-9 cursor-pointer transition-colors text-center px-4">
                        <FiUploadCloud size={24} className="text-gold" />
                        <span className="text-sm">{c.proofAdd}</span>
                        <span className="text-[11px] text-muted">{c.proofHint}</span>
                        <input type="file" accept="image/*" hidden onChange={handleProof} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </fieldset>
          </div>

          <aside className="bg-surface border border-gold/15 p-6 sm:p-8 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-2xl mb-6">{c.summary}</h2>
            <ul className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1" data-lenis-prevent>
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 text-sm">
                  <div className="relative w-14 h-16 bg-surface2 shrink-0 overflow-hidden">
                    {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                    <span className="absolute top-0 right-0 bg-gold text-ink text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug line-clamp-2">{item.name}</p>
                    {item.option && <p className="text-xs text-muted">{item.option}</p>}
                  </div>
                  <span className="shrink-0">{formatFCFA(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-fg/10 pt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{t.common.subtotal}</span>
                <span>{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.common.delivery}</span>
                <span>{zone.fee ? formatFCFA(zone.fee) : t.common.free}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-fg/10 pt-4">
                <span className="uppercase tracking-[0.18em] text-xs text-muted">{t.common.total}</span>
                <span className="font-display text-3xl text-gold">{formatFCFA(total)}</span>
              </div>
            </div>
            <button type="submit" disabled={submitting || !isSupabaseConfigured} className="btn-gold w-full mt-8">
              {submitting ? c.submitting : c.submit}
            </button>
            <p className="text-[11px] text-muted mt-4 leading-relaxed">{c.consent}</p>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
    </div>
  );
}
