import { notFound } from "next/navigation";

// Any unknown URL inside a locale renders that locale's styled 404 page.
// For the static (GitHub Pages) build one concrete path is pre-rendered per language;
// the deploy workflow copies it to /404.html, which GitHub Pages serves for unknown URLs.
export function generateStaticParams() {
  return [{ rest: ["404"] }];
}

export default function CatchAll() {
  notFound();
}
