"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { submitContactMessage } from "@/lib/messages";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { whatsappLink } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

const EMPTY = { name: "", phone: "", email: "", message: "" };

export default function ContactForm() {
  const { t } = useI18n();
  const c = t.contact;
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.message.trim().length < 3) {
      toast.error(c.invalid);
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error(c.needContact);
      return;
    }
    if (!isSupabaseConfigured) {
      window.open(whatsappLink(`${form.message}\n— ${form.name}`), "_blank", "noopener");
      return;
    }
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      setForm(EMPTY);
      setSent(true);
    } catch (err) {
      console.error(err);
      toast.error(c.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-surface border border-gold/20 p-10 text-center h-fit">
        <h2 className="font-display text-3xl">{c.sentTitle}</h2>
        <p className="text-muted mt-4">{c.sentText}</p>
        <button onClick={() => setSent(false)} className="btn-ghost mt-8">
          {c.newMessage}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-gold/15 p-6 sm:p-10 space-y-5 h-fit">
      <h2 className="font-display text-3xl mb-2">{c.formTitle}</h2>
      <div>
        <label htmlFor="c-name" className="field-label">
          {c.name}
        </label>
        <input id="c-name" autoComplete="name" maxLength={80} value={form.name} onChange={update("name")} className="input" />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="c-phone" className="field-label">
            {c.phone}
          </label>
          <input id="c-phone" type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={update("phone")} className="input" />
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">
            {c.email}
          </label>
          <input id="c-email" type="email" autoComplete="email" maxLength={120} value={form.email} onChange={update("email")} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">
          {c.message}
        </label>
        <textarea id="c-message" rows={6} maxLength={2000} value={form.message} onChange={update("message")} className="input resize-none" />
      </div>
      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? c.sending : c.send}
      </button>
    </form>
  );
}
