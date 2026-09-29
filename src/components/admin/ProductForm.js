"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiUploadCloud, FiX, FiStar, FiTrash2 } from "react-icons/fi";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/lib/products";
import { slugify } from "@/lib/format";
import { confirmDanger } from "@/lib/adminUi";
import { ADMIN_BASE, CATEGORIES } from "@/config/site";
import { useAdminI18n } from "@/i18n/AdminI18nProvider";

const LIST_URL = `${ADMIN_BASE}/dashboard/produits`;

export default function ProductForm({ product }) {
  const router = useRouter();
  const { t, dict } = useAdminI18n();
  const f = t.form;
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    category: product?.category || CATEGORIES[0].slug,
    price: product?.price ?? "",
    options: product?.options?.join(", ") || "",
    description: product?.description || "",
    descriptionEn: product?.descriptionEn || "",
    featured: product?.featured || false,
    sold: product?.sold || false,
  });
  const [images, setImages] = useState(product?.images || []);
  // Removed images are only deleted from Storage once the form is saved, so leaving
  // the page without saving never destroys a picture.
  const [removed, setRemoved] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const tooBig = files.find((file) => file.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error(f.tooBig(tooBig.name));
      return;
    }
    setUploading(true);
    try {
      const folder = slugify(form.name) || "produit";
      const urls = [];
      for (const file of files) urls.push(await uploadProductImage(file, folder));
      setImages((imgs) => [...imgs, ...urls]);
      toast.success(f.uploaded(urls.length));
    } catch (err) {
      console.error(err);
      toast.error(f.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setRemoved((r) => [...r, images[idx]]);
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const makeMain = (idx) =>
    setImages((imgs) => {
      const copy = [...imgs];
      const [chosen] = copy.splice(idx, 1);
      return [chosen, ...copy];
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    if (form.name.trim().length < 2) return toast.error(f.errName);
    if (form.price === "" || !Number.isFinite(price) || price < 0) return toast.error(f.errPrice);
    if (!images.length) return toast.error(f.errImages);

    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || null,
      category: form.category,
      price: Math.round(price),
      options: form.options
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: form.description.trim(),
      descriptionEn: form.descriptionEn.trim() || null,
      featured: form.featured,
      sold: form.sold,
      images,
    };

    setSaving(true);
    try {
      if (isEdit) {
        // The slug (URL) is kept on edit so existing links and Google results keep working.
        await updateProduct(product.id, payload);
      } else {
        const base = slugify(payload.name) || "produit";
        try {
          await createProduct({ ...payload, slug: base });
        } catch (err) {
          if (err?.code !== "23505") throw err; // slug already taken -> add a short suffix
          await createProduct({ ...payload, slug: `${base}-${Math.random().toString(36).slice(2, 6)}` });
        }
      }
      await Promise.all(removed.map((url) => deleteProductImage(url)));
      toast.success(isEdit ? f.saved : f.created);
      router.push(LIST_URL);
    } catch (err) {
      console.error(err);
      toast.error(f.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirmDanger(f.deleteTitle, t.products.irreversible, t.confirm))) return;
    try {
      await deleteProduct(product.id);
      await Promise.all([...images, ...removed].map((url) => deleteProductImage(url)));
      toast.success(t.products.deleted);
      router.push(LIST_URL);
    } catch (err) {
      console.error(err);
      toast.error(t.deleteFailed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface border border-fg/10 p-5 sm:p-7 space-y-5">
          <Field label={f.name} id="name">
            <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder={f.namePh} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={f.category} id="category">
              <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="input cursor-pointer">
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {dict.categories[c.slug].name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={f.price} id="price">
              <input
                id="price"
                type="number"
                inputMode="numeric"
                min="0"
                step="50"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="input"
                placeholder="15000"
              />
            </Field>
          </div>

          <Field label={f.options} id="options" hint={f.optionsHint}>
            <input id="options" value={form.options} onChange={(e) => update("options", e.target.value)} className="input" placeholder="38, 39, 40" />
          </Field>

          <Field label={f.description} id="description">
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input resize-none"
              placeholder={f.descriptionPh}
            />
          </Field>

          <div className="flex flex-wrap gap-6">
            <Toggle checked={form.featured} onChange={(v) => update("featured", v)} label={f.featured} />
            <Toggle checked={form.sold} onChange={(v) => update("sold", v)} label={f.sold} />
          </div>
        </div>

        <div className="bg-surface border border-fg/10 p-5 sm:p-7 space-y-5">
          <p className="text-xs text-muted flex items-center gap-2">
            <span className="px-1.5 py-0.5 border border-fg/20 text-[10px] font-semibold">EN</span>
            {f.englishHint}
          </p>
          <Field label={f.nameEn} id="nameEn">
            <input id="nameEn" lang="en" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} className="input" placeholder={f.nameEnPh} />
          </Field>
          <Field label={f.descriptionEn} id="descriptionEn">
            <textarea
              id="descriptionEn"
              lang="en"
              rows={4}
              value={form.descriptionEn}
              onChange={(e) => update("descriptionEn", e.target.value)}
              className="input resize-none"
            />
          </Field>
        </div>
      </div>

      <div className="bg-surface border border-fg/10 p-5 sm:p-7 space-y-5 h-fit">
        <div>
          <p className="field-label">{f.images}</p>
          <label
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-fg/20 py-8 cursor-pointer hover:border-gold transition-colors ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <FiUploadCloud size={22} className="text-gold" />
            <span className="text-xs text-muted">{uploading ? f.uploading : f.addImages}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFiles} />
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative aspect-[4/5] group bg-surface2">
                <Image src={url} alt={`${i + 1}`} fill className="object-cover" sizes="120px" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-white text-[9px] font-bold px-1.5 py-0.5">{f.main}</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1 bg-gradient-to-t from-black/60 to-transparent">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(i)}
                      className="w-7 h-7 bg-white text-black flex items-center justify-center cursor-pointer"
                      title={f.makeMain}
                      aria-label={f.makeMain}
                    >
                      <FiStar size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="w-7 h-7 bg-white text-red-600 flex items-center justify-center cursor-pointer"
                    title={f.removeImage}
                    aria-label={f.removeImage}
                  >
                    <FiX size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={saving || uploading} className="btn-gold w-full">
          {saving ? f.saving : isEdit ? f.save : f.create}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 w-full text-sm text-danger hover:underline cursor-pointer"
          >
            <FiTrash2 size={14} /> {f.deleteProduct}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[rgb(var(--c-gold))]"
      />
      {label}
    </label>
  );
}
