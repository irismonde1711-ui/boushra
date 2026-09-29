export function formatFCFA(amount) {
  const n = Math.round(Number(amount || 0));
  // fr-FR groups with a narrow no-break space ("18 000"), which is how prices are
  // written in Senegal.
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export function formatDate(value, withTime = false, locale = "fr-FR") {
  if (!value) return "";
  return new Date(value).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function shortOrderId(id) {
  return String(id || "").slice(0, 8).toUpperCase();
}

export function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
