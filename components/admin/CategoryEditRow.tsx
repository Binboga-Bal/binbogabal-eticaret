"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  showOnHome: boolean;
  order: number;
  _count: { products: number };
}

interface Props {
  category: CategoryWithCount;
}

export function CategoryEditRow({ category }: Props) {
  const router = useRouter();
  const [image, setImage] = useState<string>(category.image ?? "");
  const [showOnHome, setShowOnHome] = useState(category.showOnHome);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patchImage = useCallback(async (url: string) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [category.id, router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/categories");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setImage(data.url);
        await patchImage(data.url);
      }
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    setImage("");
    await patchImage("");
  }

  async function toggleShowOnHome() {
    const next = !showOnHome;
    setShowOnHome(next);
    setSaving(true);
    try {
      await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHome: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const busy = uploading || saving;

  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div
        className="relative w-12 h-12 rounded-xl overflow-hidden bg-honey-light flex-shrink-0 cursor-pointer group border border-gray-200"
        onClick={() => !busy && fileRef.current?.click()}
        title="Görsel yükle"
      >
        {image ? (
          <Image src={image} alt={category.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">🍯</div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-bold">{busy ? "..." : "📷"}</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{category.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-400">{category.slug} · {category._count.products} ürün</p>
          {image && (
            <button
              type="button"
              onClick={removeImage}
              disabled={busy}
              className="text-xs text-red-400 hover:text-red-600 hover:underline disabled:opacity-50"
            >
              görseli kaldır
            </button>
          )}
        </div>
      </div>

      {/* Anasayfada göster toggle */}
      <button
        type="button"
        onClick={toggleShowOnHome}
        disabled={busy}
        title={showOnHome ? "Anasayfadan kaldır" : "Anasayfada göster"}
        className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
          showOnHome
            ? "bg-honey/10 border-honey text-honey-dark"
            : "bg-gray-100 border-gray-200 text-gray-400 hover:border-honey hover:text-honey-dark"
        }`}
      >
        <span>{showOnHome ? "🏠" : "🏠"}</span>
        <span>{showOnHome ? "Anasayfa" : "Gizli"}</span>
      </button>

      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
        category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}>
        {category.isActive ? "Aktif" : "Pasif"}
      </span>
    </div>
  );
}
