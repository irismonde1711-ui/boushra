"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiStar } from "react-icons/fi";
import { fetchAllProducts, deleteProduct, updateProduct, deleteProductImage } from "@/lib/products";
import { formatFCFA } from "@/lib/format";
import { confirmDanger } from "@/lib/adminUi";
import { ADMIN_BASE, CATEGORIES } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";
import { localizeProduct } from "@/i18n";

export default function AdminProductsPage() {
  const { t, dict, lang } = useAdminI18n();
  const p = t.products;
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchAllProducts()
      .then((items) => {
        setProducts(items);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const toggle = async (item, key, message) => {
    try {
      await updateProduct(item.id, { [key]: !item[key] });
      setProducts((list) => list.map((x) => (x.id === item.id ? { ...x, [key]: !x[key] } : x)));
      toast.success(message(!item[key]));
    } catch (err) {
      console.error(err);
      toast.error(p.updateFailed);
    }
  };

  const handleDelete = async (item) => {
    const name = localizeProduct(item, lang).name;
    if (!(await confirmDanger(p.deleteTitle(name), p.irreversible, t.confirm))) return;
    try {
      await deleteProduct(item.id);
      await Promise.all(item.images.map((url) => deleteProductImage(url)));
      setProducts((list) => list.filter((x) => x.id !== item.id));
      toast.success(p.deleted);
    } catch (err) {
      console.error(err);
      toast.error(t.deleteFailed);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (x) =>
        (category === "all" || x.category === category) &&
        (!q || x.name.toLowerCase().includes(q) || x.nameEn?.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">{p.title(products.length)}</h1>
        <Link href={`${ADMIN_BASE}/dashboard/produits/nouveau`} className="btn-gold self-start">
          <FiPlusCircle /> {p.add}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={p.search} className="input pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input sm:w-60 cursor-pointer">
          <option value="all">{p.allCategories}</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {dict.categories[c.slug].name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-fg/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-fg/10">
              <th className="p-4 font-medium">{p.colProduct}</th>
              <th className="p-4 font-medium">{p.colCategory}</th>
              <th className="p-4 font-medium">{p.colPrice}</th>
              <th className="p-4 font-medium">{p.colStock}</th>
              <th className="p-4 font-medium">{p.colHome}</th>
              <th className="p-4 font-medium text-right">{p.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-fg/10">
                  <td colSpan={6} className="p-4">
                    <div className="h-10 bg-surface2 animate-pulse" />
                  </td>
                </tr>
              ))}
            {status === "error" && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-danger">
                  {p.loadError}
                </td>
              </tr>
            )}
            {status === "ready" &&
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-fg/10 last:border-none">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-14 bg-surface2 shrink-0 overflow-hidden">
                        {item.images[0] && <Image src={item.images[0]} alt="" fill className="object-cover" sizes="44px" />}
                      </div>
                      <Link
                        href={`${lang === "en" ? "/en" : ""}/produit/${item.slug}`}
                        target="_blank"
                        className="font-medium hover:text-gold"
                      >
                        {localizeProduct(item, lang).name}
                      </Link>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{dict.categories[item.category]?.short || item.category}</td>
                  <td className="p-4 whitespace-nowrap">{formatFCFA(item.price)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggle(item, "sold", (sold) => (sold ? p.markedSold : p.restocked))}
                      className={`text-[11px] font-semibold px-2.5 py-1 cursor-pointer ${
                        item.sold ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                      }`}
                      title={p.toggleHint}
                    >
                      {item.sold ? p.soldOut : p.inStock}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggle(item, "featured", (f) => (f ? p.featured : p.unfeatured))}
                      className={`cursor-pointer ${item.featured ? "text-gold" : "text-fg/20 hover:text-fg/50"}`}
                      aria-label={item.featured ? p.unfeature : p.feature}
                      title={item.featured ? p.unfeature : p.feature}
                    >
                      <FiStar size={18} className={item.featured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`${ADMIN_BASE}/dashboard/produits/${item.id}`}
                        className="text-muted hover:text-fg"
                        aria-label={p.edit}
                        title={p.edit}
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-muted hover:text-danger cursor-pointer"
                        aria-label={p.delete}
                        title={p.delete}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {status === "ready" && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted">
                  {p.none}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
