// Two deployment modes:
// - default (Vercel / any Node host): server rendering, middleware for FR/EN, image optimisation.
// - NEXT_PUBLIC_STATIC_EXPORT=true (GitHub Pages): plain static files under NEXT_PUBLIC_BASE_PATH,
//   built by .github/workflows/deploy-pages.yml.
const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = isStatic
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { loader: "custom", loaderFile: "./src/lib/imageLoader.js" },
    }
  : {
      images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
          {
            protocol: "https",
            hostname: "*.supabase.co",
          },
        ],
      },
    };

module.exports = nextConfig;
