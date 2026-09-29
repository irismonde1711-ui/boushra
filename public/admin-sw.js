// Service worker for the installable admin app (registered with scope <base>/espace-boushra).
// Admin data always comes live from Supabase (cross-origin, never cached here); this
// worker only keeps the app shell available so the installed app opens offline.
// Paths are relative to where this file is served, so it works at the domain root
// (Vercel) and under a sub-path (GitHub Pages: /boushra/).
const CACHE = "boushra-admin-v3";
const BASE = new URL("./", self.location).pathname; // "/" or "/boushra/"
const ADMIN = `${BASE}espace-boushra`;
const SHELL = [ADMIN, `${ADMIN}/dashboard`, `${BASE}icons/icon-192.png`, `${BASE}icons/icon-512.png`];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Hashed build assets never change: cache-first.
  if (url.pathname.startsWith(`${BASE}_next/static/`) || url.pathname.startsWith(`${BASE}icons/`)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Admin pages: network-first, fall back to the last cached copy when offline.
  if (request.mode === "navigate" && url.pathname.startsWith(ADMIN)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(`${ADMIN}/dashboard`)))
    );
  }
});
