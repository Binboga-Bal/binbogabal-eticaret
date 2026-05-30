"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CategoryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true, showOnHome: false, image: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: name
        .toLowerCase()
        .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images/categories");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, image: data.url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.refresh();
    setForm({ name: "", slug: "", description: "", isActive: true, showOnHome: false, image: "" });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Kategori Adı"
        value={form.name}
        onChange={(e) => handleNameChange(e.target.value)}
        required
      />
      <Input
        label="Slug"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
        />
      </div>

      {/* Resim */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Görseli</label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-honey-light border border-gray-200 flex-shrink-0">
            {form.image ? (
              <Image src={form.image} alt="önizleme" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">🍯</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {form.image ? "Görseli Değiştir" : "Görsel Yükle"}
            </Button>
            {form.image && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="text-xs text-red-500 hover:underline text-left"
              >
                Görseli Kaldır
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="accent-honey-dark"
          />
          <span className="text-sm text-gray-700">Aktif</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.showOnHome}
            onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
            className="accent-honey-dark"
          />
          <span className="text-sm text-gray-700">Anasayfada Göster</span>
        </label>
      </div>
      <Button type="submit" loading={saving} className="w-full">Kategori Oluştur</Button>
    </form>
  );
}
