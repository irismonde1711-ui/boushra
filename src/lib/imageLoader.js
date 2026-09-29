// Static-export image loader (GitHub Pages): no optimisation server, so images are served
// as-is. Local files need the base path (/boushra) prepended; remote URLs pass through.
export default function imageLoader({ src }) {
  return src.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${src}` : src;
}
