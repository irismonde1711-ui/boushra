import "../globals.css";
import { fontClasses } from "../fonts";
import AdminPwaRegister from "@/components/admin/AdminPwaRegister";
import ToasterProvider from "@/components/ui/ToasterProvider";
import { AdminI18nProvider } from "@/i18n/AdminI18nProvider";
import { SITE } from "@/config/site";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Boushra Admin",
    template: "%s | Boushra Admin",
  },
  manifest: "/manifest-admin.json",
  robots: { index: false, follow: false, nocache: true },
  appleWebApp: { capable: true, title: "Boushra Admin", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({ children }) {
  return (
    <html lang="fr" className={fontClasses}>
      <body className="font-body antialiased">
        <AdminI18nProvider>
          <div className="admin-root min-h-screen bg-bg text-fg">
            <ToasterProvider />
            <AdminPwaRegister />
            {children}
          </div>
        </AdminI18nProvider>
      </body>
    </html>
  );
}
