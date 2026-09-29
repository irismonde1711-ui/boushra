// Finishes the static export in ./out for GitHub Pages:
// - index.html at the root sends visitors to /fr/ (or /en/ if they picked English before)
// - 404.html (GitHub Pages serves it for unknown URLs) = the pre-rendered French 404 page
// - .nojekyll so the _next/ folder is served as-is
import { copyFileSync, existsSync, writeFileSync } from "node:fs";

const out = new URL("../out/", import.meta.url);
const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

writeFileSync(
  new URL("index.html", out),
  `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Boushra Services Textile Beauté</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${site}/fr/">
<script>location.replace((/(?:^|; )NEXT_LOCALE=en/.test(document.cookie) ? "en" : "fr") + "/" + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=fr/">
</head>
<body style="background:#090909"><a href="fr/" style="color:#e9ba0c">Boushra</a></body>
</html>
`
);

const notFound = new URL("fr/404/index.html", out);
if (existsSync(notFound)) copyFileSync(notFound, new URL("404.html", out));
else console.warn("pages-postbuild: fr/404/index.html not found — no custom 404 page");

writeFileSync(new URL(".nojekyll", out), "");
console.log("pages-postbuild: index.html, 404.html, .nojekyll written");
