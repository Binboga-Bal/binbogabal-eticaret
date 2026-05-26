"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import type { SerializedProduct } from "@/lib/utils/serialize";

const schema = z.object({
  name: z.string().min(2, "Ad gerekli"),
  slug: z.string().min(2, "Slug gerekli"),
  shortDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface VariantRow {
  id?: string;
  erpVariantCode?: string | null;
  size: number;
  packagingType: "GLASS" | "PLASTIC";
  price: number;
  discountedPrice: number | null;
  stock: number;
  sku: string;
  maxOrderQuantity: number | null;
}

interface Props {
  product: SerializedProduct | null;
  categories: { id: string; name: string }[];
  honeyTypes: { id: string; slug: string; label: string }[];
}

export function ProductEditForm({ product, categories, honeyTypes }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map((c) => c.id) ?? []
  );
  const [selectedHoneyTypeIds, setSelectedHoneyTypeIds] = useState<string[]>(
    product?.honeyTypes?.map((t) => t.id) ?? []
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      id: v.id,
      erpVariantCode: v.erpVariantCode ?? null,
      size: v.size,
      packagingType: v.packagingType as "GLASS" | "PLASTIC",
      price: v.price,
      discountedPrice: v.discountedPrice,
      stock: v.stock,
      sku: v.sku ?? "",
      maxOrderQuantity: (v as { maxOrderQuantity?: number | null }).maxOrderQuantity ?? null,
    })) ?? []
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      shortDescription: product?.shortDescription ?? "",
      isActive: product?.isActive ?? true,
      isBestseller: product?.isBestseller ?? false,
      isFeatured: product?.isFeatured ?? false,
      isNew: product?.isNew ?? false,
      description: product?.description ?? "",
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images/products");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setImages((prev) => [...prev, data.url as string]);
    else setError(data.error ?? "Yükleme hatası");
    e.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function addVariant() {
    setVariants((v) => [...v, { size: 450, packagingType: "GLASS", price: 0, discountedPrice: null, stock: 0, sku: "", maxOrderQuantity: null }]);
  }

  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  function updateVariant(i: number, key: keyof VariantRow, value: string | number | null) {
    setVariants((v) => v.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  }

  async function onSubmit(data: FormValues) {
    setSaving(true);
    setError("");

    const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, variants, images, categoryIds: selectedCategoryIds, honeyTypeIds: selectedHoneyTypeIds }),
    });

    const result = await res.json();
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push("/admin/urunler");
  }

  const nameValue = watch("name");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temel bilgiler */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Temel Bilgiler</h2>

          <Input label="Ürün Adı" {...register("name")} error={errors.name?.message}
            onChange={(e) => {
              register("name").onChange(e);
              if (!product) {
                setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }
            }}
          />
          <Input label="Slug (URL)" {...register("slug")} error={errors.slug?.message} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
            <textarea {...register("shortDescription")} rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(c.id)}
                      onChange={(e) =>
                        setSelectedCategoryIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                        )
                      }
                      className="accent-honey-dark w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bal Türü</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {honeyTypes.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedHoneyTypeIds.includes(t.id)}
                      onChange={(e) =>
                        setSelectedHoneyTypeIds((prev) =>
                          e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                        )
                      }
                      className="accent-honey-dark w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "isActive" as const, label: "Aktif" },
                { name: "isBestseller" as const, label: "Çok Satan" },
                { name: "isFeatured" as const, label: "Avantajlı" },
                { name: "isNew" as const, label: "Yeni" },
              ].map((f) => (
                <label key={f.name} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(f.name)} className="accent-honey-dark w-4 h-4" />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Açıklama */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Ürün Açıklaması</h2>
          <textarea
            {...register("description")}
            rows={14}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-honey"
            placeholder="HTML formatında açıklama..."
          />
          <p className="text-xs text-gray-400 mt-1">HTML etiketleri kullanabilirsiniz.</p>
        </div>
      </div>

      {/* Görseller */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Ürün Görselleri</h2>
          <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload size={14} /> Görsel Yükle
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
        {images.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-honey hover:text-honey transition-colors"
          >
            <Upload size={24} />
            <span className="text-xs">{uploading ? "Yükleniyor..." : "Görsel eklemek için tıklayın"}</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Görsel ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-honey-dark text-white text-[10px] font-bold px-1 rounded">ANA</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 cursor-pointer hover:border-honey hover:text-honey transition-colors"
            >
              <Plus size={20} />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">İlk görsel ana görsel olarak kullanılır. JPEG, PNG veya WebP, maks 5MB.</p>
      </div>

      {/* Varyantlar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800">Varyantlar (Gram / Ambalaj)</h2>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}>
            <Plus size={14} /> Varyant Ekle
          </Button>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Henüz varyant eklenmedi. En az bir varyant ekleyin.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-3">
              <div className="grid grid-cols-[60px_85px_80px_80px_60px_100px_80px_32px] gap-3 text-xs font-semibold text-gray-500 uppercase px-1">
                <span>Gram</span>
                <span>Ambalaj</span>
                <span>Fiyat (₺)</span>
                <span>İnd. Fiyat</span>
                <span>Stok</span>
                <span>SKU</span>
                <span title="Müşterinin tek siparişte alabileceği maksimum adet">Max Sipariş</span>
                <span />
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[60px_85px_80px_80px_60px_100px_80px_32px] gap-3 items-center bg-gray-50 rounded-xl p-3">
                  <input type="number" value={v.size} onChange={(e) => updateVariant(i, "size", parseInt(e.target.value))}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  />
                  <select value={v.packagingType} onChange={(e) => updateVariant(i, "packagingType", e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  >
                    <option value="GLASS">Cam</option>
                    <option value="PLASTIC">Plastik</option>
                  </select>
                  <input type="number" value={v.price} onChange={(e) => updateVariant(i, "price", parseFloat(e.target.value))}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  />
                  <input type="number" value={v.discountedPrice ?? ""} placeholder="Yok"
                    onChange={(e) => updateVariant(i, "discountedPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  />
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value))}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  />
                  <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                    placeholder="SKU"
                  />
                  <input
                    type="number"
                    min={1}
                    value={v.maxOrderQuantity ?? ""}
                    placeholder="—"
                    onChange={(e) => updateVariant(i, "maxOrderQuantity", e.target.value ? parseInt(e.target.value) : null)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  />
                  <button type="button" onClick={() => removeVariant(i)}
                    className="text-red-400 hover:text-red-600 p-1 flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={saving} size="lg">
          {product ? "Güncelle" : "Oluştur"}
        </Button>
        <Link href="/admin/urunler">
          <Button type="button" variant="ghost" size="lg">İptal</Button>
        </Link>
      </div>
    </form>
  );
}
