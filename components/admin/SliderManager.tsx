"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload, Trash2, GripVertical, Plus, Eye, EyeOff,
  CheckCircle, AlertTriangle, Loader2, Link as LinkIcon,
} from "lucide-react";

interface Slide {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  initialSlides: Slide[];
}

export function SliderManager({ initialSlides }: Props) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // id of slide being saved
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Upload new slide ────────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    setUploading(true);

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/products");

      try {
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error ?? "Yükleme başarısız");
        }
        const { url } = await uploadRes.json();

        const createRes = await fetch("/api/admin/slider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });
        if (!createRes.ok) throw new Error("Slide oluşturulamadı");
        const newSlide: Slide = await createRes.json();
        setSlides((prev) => [...prev, newSlide]);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : "Hata oluştu");
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  // ── Toggle active ───────────────────────────────────────────────────────────
  const toggleActive = useCallback(async (slide: Slide) => {
    const next = !slide.isActive;
    setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, isActive: next } : s));
    await fetch(`/api/admin/slider/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
  }, []);

  // ── Update linkUrl / altText ────────────────────────────────────────────────
  const updateField = useCallback((id: string, field: "linkUrl" | "altText", value: string) => {
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }, []);

  const saveSlide = useCallback(async (slide: Slide) => {
    setSaving(slide.id);
    await fetch(`/api/admin/slider/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkUrl: slide.linkUrl, altText: slide.altText }),
    });
    setSaving(null);
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteSlide = useCallback(async (id: string) => {
    if (!confirm("Bu slide'ı silmek istediğinizden emin misiniz?")) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/admin/slider/${id}`, { method: "DELETE" });
  }, []);

  // ── Drag-to-reorder ─────────────────────────────────────────────────────────
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = useCallback(async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }

    setSlides((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((s) => s.id === dragId);
      const toIdx = arr.findIndex((s) => s.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr.map((s, i) => ({ ...s, sortOrder: i }));
    });

    setDragId(null);
    setDragOverId(null);

    // Persist new order
    setSlides((current) => {
      fetch("/api/admin/slider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current.map(({ id, sortOrder }) => ({ id, sortOrder }))),
      });
      return current;
    });
  }, [dragId]);

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-honey-medium text-white rounded-lg text-sm font-semibold hover:bg-honey-dark disabled:opacity-60 transition-colors"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Slide Ekle
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadError && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} /> {uploadError}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Birden fazla görsel seçebilirsiniz. Önerilen boyut: 1920 × 700 px · Maks 5 MB
        </p>
      </div>

      {/* Slide list */}
      {slides.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
          <Upload size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Henüz slide eklenmedi. Yukarıdaki butona tıklayın.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(slide.id)}
              onDragOver={(e) => handleDragOver(e, slide.id)}
              onDrop={() => handleDrop(slide.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`
                flex gap-3 bg-white border rounded-xl p-3 transition-all
                ${dragOverId === slide.id ? "border-honey-medium shadow-md scale-[1.01]" : "border-gray-200"}
                ${!slide.isActive ? "opacity-60" : ""}
              `}
            >
              {/* Drag handle */}
              <div className="flex items-center text-gray-300 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
              </div>

              {/* Order badge */}
              <div className="flex items-center justify-center w-6 shrink-0 text-xs font-bold text-gray-400">
                {idx + 1}
              </div>

              {/* Thumbnail */}
              <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image src={slide.imageUrl} alt={slide.altText ?? `Slide ${idx + 1}`} fill className="object-cover" />
              </div>

              {/* Fields */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5">
                  <LinkIcon size={12} className="text-gray-400 shrink-0" />
                  <input
                    type="url"
                    placeholder="Tıklanınca gidilecek URL (opsiyonel)"
                    value={slide.linkUrl ?? ""}
                    onChange={(e) => updateField(slide.id, "linkUrl", e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-honey-medium"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Alt metin (erişilebilirlik)"
                    value={slide.altText ?? ""}
                    onChange={(e) => updateField(slide.id, "altText", e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-honey-medium"
                  />
                  <button
                    type="button"
                    onClick={() => saveSlide(slide)}
                    disabled={saving === slide.id}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium disabled:opacity-60 transition-colors"
                  >
                    {saving === slide.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <CheckCircle size={12} className="text-green-600" />}
                    Kaydet
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  title={slide.isActive ? "Pasife al" : "Aktife al"}
                  onClick={() => toggleActive(slide)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  {slide.isActive
                    ? <Eye size={16} className="text-green-600" />
                    : <EyeOff size={16} className="text-gray-400" />}
                </button>
                <button
                  type="button"
                  title="Sil"
                  onClick={() => deleteSlide(slide.id)}
                  className="p-1.5 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Sürükleyip bırakarak sırayı değiştirebilirsiniz. Göz simgesine tıklayarak slide'ı geçici olarak gizleyebilirsiniz.
      </p>
    </div>
  );
}
