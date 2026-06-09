"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GripVertical, Plus, Trash2, Upload, X, Search } from "lucide-react";
import type { SerializedProduct } from "@/lib/utils/serialize";

const USAGE_OPTIONS = [
  { key: "kahvalti", label: "Kahvaltı" },
  { key: "cay", label: "Çay" },
  { key: "tatli", label: "Tatlı" },
  { key: "smoothie", label: "Smoothie" },
  { key: "pisen", label: "Pişen Tarif" },
  { key: "atistirmalik", label: "Atıştırmalık" },
] as const;

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

interface RelatedItem {
  id: string;
  name: string;
  images: string[];
}

interface Props {
  product: SerializedProduct | null;
  categories: { id: string; name: string }[];
  honeyTypes: { id: string; slug: string; label: string }[];
  initialRelatedProducts?: RelatedItem[];
}

const MAX_IMAGES = 3;

export function ProductEditForm({ product, categories, honeyTypes, initialRelatedProducts = [] }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map((c) => c.id) ?? []
  );
  const [selectedHoneyTypeIds, setSelectedHoneyTypeIds] = useState<string[]>(
    product?.honeyTypes?.map((t) => t.id) ?? []
  );
  const [tasteNotes, setTasteNotes] = useState<string[]>(
    (product?.tasteNotes as string[] | null) ?? []
  );
  const [selectedUsage, setSelectedUsage] = useState<string[]>(
    (product?.usageSuggestions as string[] | null) ?? []
  );
  const [analysisReportUrl, setAnalysisReportUrl] = useState<string>(
    (product as { analysisReportUrl?: string | null })?.analysisReportUrl ?? ""
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedItem[]>(initialRelatedProducts);
  const [relatedQuery, setRelatedQuery] = useState("");
  const [relatedResults, setRelatedResults] = useState<RelatedItem[]>([]);
  const [relatedSearchOpen, setRelatedSearchOpen] = useState(false);
  const [relatedSearching, setRelatedSearching] = useState(false);

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
    if (images.length >= MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz.`);
      e.target.value = "";
      return;
    }
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

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDragStart(i: number) {
    setDragSrcIdx(i);
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (i !== dragSrcIdx) setDragOverIdx(i);
  }

  function handleDrop(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragSrcIdx === null || dragSrcIdx === i) return;
    moveImage(dragSrcIdx, i);
    setDragSrcIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDragSrcIdx(null);
    setDragOverIdx(null);
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "documents");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingPdf(false);
    if (data.url) setAnalysisReportUrl(data.url as string);
    else setError(data.error ?? "PDF yükleme hatası");
    e.target.value = "";
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
      body: JSON.stringify({ ...data, variants, images, categoryIds: selectedCategoryIds, honeyTypeIds: selectedHoneyTypeIds, tasteNotes, usageSuggestions: selectedUsage, analysisReportUrl: analysisReportUrl || null, relatedProductIds: relatedProducts.map((p) => p.id) }),
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

  const searchRelated = useCallback(async (q: string) => {
    setRelatedQuery(q);
    if (!q.trim()) { setRelatedResults([]); return; }
    setRelatedSearching(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`);
      const data: RelatedItem[] = await res.json();
      setRelatedResults(
        data
          .filter((p) => p.id !== product?.id && !relatedProducts.some((r) => r.id === p.id))
          .map((p) => ({ ...p, images: Array.isArray(p.images) ? (p.images as string[]) : [] }))
      );
    } finally {
      setRelatedSearching(false);
    }
  }, [product?.id, relatedProducts]);

  function addRelated(item: RelatedItem) {
    setRelatedProducts((prev) => [...prev, item]);
    setRelatedQuery("");
    setRelatedResults([]);
    setRelatedSearchOpen(false);
  }

  function removeRelated(id: string) {
    setRelatedProducts((prev) => prev.filter((p) => p.id !== id));
  }

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
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={images.length >= MAX_IMAGES}
            onClick={() => fileRef.current?.click()}
            loading={uploading}
          >
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
              <div
                key={url}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-grab active:cursor-grabbing transition-opacity ${
                  dragSrcIdx === i ? "opacity-40" : "opacity-100"
                } ${dragOverIdx === i ? "ring-2 ring-honey ring-offset-1 rounded-xl" : ""}`}
              >
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Görsel ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-honey-dark text-white text-[10px] font-bold px-1 rounded">ANA</span>
                )}
                <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-70 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 cursor-pointer hover:border-honey hover:text-honey transition-colors"
              >
                <Plus size={20} />
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          En fazla {MAX_IMAGES} görsel yüklenebilir. İlk görsel ana görsel olarak kullanılır. Sıralamak için sürükleyin.
        </p>
      </div>

      {/* Analiz Raporu */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-800">Analiz Raporu (PDF)</h2>
        <div className="flex items-start gap-4">
          {/* Mevcut dosya */}
          <div className="flex-1 min-w-0">
            {analysisReportUrl ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
                  <polyline points="14,2 14,8 20,8" strokeLinejoin="round" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {analysisReportUrl.split("/").pop()}
                  </p>
                  <a href={analysisReportUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline">
                    Önizle →
                  </a>
                </div>
                <button type="button" onClick={() => setAnalysisReportUrl("")}
                  className="text-red-400 hover:text-red-600 p-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => pdfRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl h-16 flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-honey hover:text-honey transition-colors"
              >
                <Upload size={18} />
                <span className="text-sm">{uploadingPdf ? "Yükleniyor..." : "PDF yüklemek için tıklayın"}</span>
              </div>
            )}
            <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          </div>
          {analysisReportUrl && (
            <Button type="button" size="sm" variant="outline" onClick={() => pdfRef.current?.click()} loading={uploadingPdf}>
              <Upload size={14} /> Değiştir
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400">Yalnızca PDF formatı desteklenir. Bu rapor ürün detay sayfasında görüntülenecektir.</p>
      </div>

      {/* Tat Profili ve Kullanım Önerileri */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-800">Tat Profili ve Kullanım Önerileri</h2>

        {/* Tat notları */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tat Notları
            <span className="ml-1 font-normal text-gray-400 text-xs">(her satır ayrı madde)</span>
          </label>
          <div className="space-y-2">
            {tasteNotes.map((note, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={note}
                  onChange={(e) =>
                    setTasteNotes((prev) =>
                      prev.map((n, idx) => (idx === i ? e.target.value : n))
                    )
                  }
                  placeholder={`Not ${i + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                />
                <button
                  type="button"
                  onClick={() => setTasteNotes((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTasteNotes((prev) => [...prev, ""])}
              className="flex items-center gap-1.5 text-sm text-honey-dark hover:text-honey font-medium"
            >
              <Plus size={14} /> Not Ekle
            </button>
          </div>
        </div>

        {/* Kullanım önerileri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kullanım Önerileri</label>
          <div className="flex flex-wrap gap-2">
            {USAGE_OPTIONS.map((opt) => {
              const active = selectedUsage.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setSelectedUsage((prev) =>
                      active ? prev.filter((k) => k !== opt.key) : [...prev, opt.key]
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-honey border-honey text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-honey"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
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

      {/* Yanında İyi Gider */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">Yanında İyi Gider</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ürün detay sayfasında vitrin olarak gösterilecek ilgili ürünler.
              Boş bırakılırsa aynı bal türünden ürünler otomatik seçilir.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setRelatedSearchOpen((v) => !v); setRelatedQuery(""); setRelatedResults([]); }}
          >
            <Plus size={14} className="mr-1" /> Ürün Ekle
          </Button>
        </div>

        {relatedSearchOpen && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3">
              <Search size={14} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Ürün adı ile ara..."
                value={relatedQuery}
                onChange={(e) => searchRelated(e.target.value)}
                className="flex-1 py-2 text-sm outline-none bg-transparent"
              />
              {relatedSearching && <span className="text-xs text-gray-400 ml-2">Aranıyor...</span>}
            </div>
            {relatedResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {relatedResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addRelated(p)}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={32} height={32} className="object-contain w-full h-full" />
                      ) : (
                        <span className="flex items-center justify-center h-full text-sm">🍯</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
            {relatedQuery && relatedResults.length === 0 && !relatedSearching && (
              <p className="text-sm text-gray-400 py-2 text-center">Sonuç bulunamadı</p>
            )}
          </div>
        )}

        {relatedProducts.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center text-sm text-gray-400">
            Manuel seçim yok — otomatik öneri aktif
          </div>
        ) : (
          <div className="space-y-1.5">
            {relatedProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="w-9 h-9 rounded overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} width={36} height={36} className="object-contain w-full h-full p-0.5" />
                  ) : (
                    <span className="flex items-center justify-center h-full text-base">🍯</span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.name}</span>
                <button type="button" onClick={() => removeRelated(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ))}
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
