"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiTrash2, FiMail, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { fetchMessages, deleteMessage } from "@/lib/messages";
import { formatDate } from "@/lib/format";
import { confirmDanger } from "@/lib/adminUi";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

const waNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 9 ? `221${digits}` : digits;
};

export default function AdminMessagesPage() {
  const { t, dict } = useAdminI18n();
  const m = t.messages;
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchMessages()
      .then((items) => {
        setMessages(items);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const handleDelete = async (msg) => {
    if (!(await confirmDanger(m.deleteTitle, m.deleteText(msg.name), t.confirm))) return;
    try {
      await deleteMessage(msg.id);
      setMessages((list) => list.filter((x) => x.id !== msg.id));
      toast.success(m.deleted);
    } catch (err) {
      console.error(err);
      toast.error(t.deleteFailed);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">{m.title(messages.length)}</h1>

      {status === "loading" && <div className="h-40 bg-surface animate-pulse" />}
      {status === "error" && <p className="text-danger text-sm">{m.loadError}</p>}
      {status === "ready" && messages.length === 0 && <p className="text-muted text-center py-16">{m.none}</p>}

      <ul className="space-y-3">
        {messages.map((msg) => (
          <li key={msg.id} className="bg-surface border border-fg/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{msg.name}</p>
                <p className="text-[11px] text-muted">{formatDate(msg.createdAt, true, dict.dateLocale)}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {msg.phone && (
                  <>
                    <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-muted hover:text-fg">
                      <FiPhone /> {msg.phone}
                    </a>
                    <a
                      href={`https://wa.me/${waNumber(msg.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a9e55]"
                      aria-label={m.replyWhatsapp}
                      title={m.replyWhatsapp}
                    >
                      <FaWhatsapp size={18} />
                    </a>
                  </>
                )}
                {msg.email && (
                  <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-muted hover:text-fg break-all">
                    <FiMail /> {msg.email}
                  </a>
                )}
                <button onClick={() => handleDelete(msg)} className="text-muted hover:text-danger cursor-pointer" aria-label={m.deleteAria}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-fg/85 leading-relaxed mt-3 whitespace-pre-line">{msg.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
