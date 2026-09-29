// Business facts and structure. All visible wording (FR/EN) lives in src/i18n/dictionaries.
// Contact info comes from Boushra's own Instagram posts; payment accounts are
// PLACEHOLDERS until the client sends real ones.

export const SITE = {
  name: "Boushra",
  fullName: "Boushra Services Textile Beauté",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, ""),
  phones: [
    { display: "76 735 37 89", e164: "+221767353789" },
    { display: "77 926 73 93", e164: "+221779267393" },
  ],
  whatsapp: "221767353789",
  email: "servicesbouchra05@gmail.com",
  instagram: "https://www.instagram.com/boushra_767353789/",
  instagramHandle: "@boushra_767353789",
  address: {
    street: "Route de l'Hôpital, à 100 m du stade Caroline Faye",
    city: "Mbour",
    region: "Thiès",
    country: "SN",
    countryName: { fr: "Sénégal", en: "Senegal" },
  },
  mapsQuery: "Stade Caroline Faye, Mbour, Sénégal",
  logo: "/images/logo-boushra.png",
  ogImage: "/images/og-boushra.jpg",
};

export const ADMIN_BASE = "/espace-boushra";

// Sub-path the site is served from on static hosting (e.g. "/boushra" on GitHub Pages).
// Next adds it to <Link> and router URLs itself; plain URLs (manifest, service worker) need it.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const whatsappLink = (text = "") =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`;

// Keep these fees in sync with prepare_order() in supabase/schema.sql — the database
// recomputes every order total from them, so the page only displays the numbers.
export const DELIVERY_ZONES = [
  { id: "retrait", fee: 0, needsAddress: false },
  { id: "mbour", fee: 1000, needsAddress: true },
  { id: "senegal", fee: 2500, needsAddress: true },
];

export const PAYMENT_METHOD_IDS = ["cod", "transfer"];

// PLACEHOLDER accounts — replace with the client's real details before going live.
// Row keys are field labels translated in the dictionaries (checkout.fields).
export const PAYMENT_ACCOUNTS = [
  {
    id: "bank",
    rows: [
      ["bank", "Banque Exemple du Sénégal"],
      ["holder", "Boushra Services Textile Beauté"],
      ["iban", "SN00 0000 0000 0000 0000 0000 000"],
      ["swift", "EXMPSNDA"],
    ],
  },
  {
    id: "wave",
    rows: [
      ["number", "77 000 00 00"],
      ["name", "Boushra"],
    ],
  },
  {
    id: "orange",
    rows: [
      ["number", "77 000 00 00"],
      ["name", "Boushra"],
    ],
  },
];

// Orders that carry a payment screenshot are deleted automatically after this many days
// (see supabase/functions/cleanup-old-orders and supabase/cron.sql).
export const PROOF_RETENTION_DAYS = 30;

export const ORDER_STATUS_KEYS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
export const PAYMENT_STATUS_KEYS = ["cod", "awaiting_verification", "verified", "rejected"];

export const CATEGORIES = [
  { slug: "bijoux", image: "/images/produits/parure-plastron-doree.webp" },
  { slug: "perruques", image: "/images/produits/perruque-carre-rouge.webp" },
  { slug: "soins", image: "/images/produits/gamme-capillaire-boushra.webp" },
  { slug: "sacs", image: "/images/produits/sac-matelasse-vieux-rose.webp" },
  { slug: "chaussures", image: "/images/produits/sandales-talons-assorties.webp" },
  { slug: "accessoires", image: "/images/produits/montre-bracelet-doree-trefle.webp" },
  { slug: "textile", image: null },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

export const SERVICES = [
  {
    slug: "coiffure",
    images: [
      "/images/services/coiffure-tresses.webp",
      "/images/services/coiffure-vanilles.webp",
      "/images/services/coiffure-pose.webp",
    ],
  },
  {
    slug: "maquillage",
    images: [
      "/images/services/maquillage-2.webp",
      "/images/services/maquillage-1.webp",
      "/images/services/maquillage-4.webp",
      "/images/services/maquillage-3.webp",
      "/images/services/maquillage-5.webp",
    ],
  },
  {
    slug: "soin-visage",
    images: ["/images/services/soin-visage-1.webp", "/images/services/soin-visage-2.webp"],
  },
  { slug: "pedicure", images: ["/images/services/pedicure.webp"] },
  {
    slug: "formation",
    images: [
      "/images/services/formation-jour-1.webp",
      "/images/services/formation-maquillage.webp",
      "/images/services/formation-eleves.webp",
      "/images/services/formation-tresses.webp",
      "/images/services/maquillage-eleve.webp",
    ],
  },
];
