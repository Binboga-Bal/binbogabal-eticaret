"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, CheckCircle, AlertTriangle, ImageOff } from "lucide-react";

interface ImageItem {
  key: string;
  label: string;
  currentUrl: string | null;
  recommendedSize: string;
  hint?: string;
}

interface ImageGroup {
  title: string;
  description: string;
  items: ImageItem[];
}

interface Props {
  groups: ImageGroup[];
}

interface UploadState {
  loading: boolean;
  error: string | null;
  success: boolean;
  resolutionWarning: string | null;
}

const DEFAULT_STATE: UploadState = { loading: false, error: null, success: false, resolutionWarning: null };

function checkResolution(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function parseRecommendedSize(size: string): { width: number; height: number } | null {
  const match = size.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (!match) return null;
  return { width: parseInt(match[1]), height: parseInt(match[2]) };
}

function ImageCard({ item }: { item: ImageItem }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(item.currentUrl);
  const [state, setState] = useState<UploadState>(DEFAULT_STATE);
  const inputRef = useRef<HTMLInputElement>(null);
  const recommended = parseRecommendedSize(item.recommendedSize);

  async function handleFile(file: File) {
    setState(DEFAULT_STATE);
    const { width, height } = await checkResolution(file);
    const resolutionWarning =
      recommended && (width !== recommended.width || height !== recommended.height)
        ? `Görsel ${width}×${height} px — önerilen ${item.recommendedSize}`
        : null;

    setState((s) => ({ ...s, resolutionWarning, loading: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "images/site-gorseller");

    const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const { error } = await uploadRes.json().catch(() => ({ error: "Yükleme başarısız" }));
      setState((s) => ({ ...s, loading: false, error }));
      return;
    }
    const { url } = await uploadRes.json();

    const saveRes = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [item.key]: url }),
    });
    if (!saveRes.ok) {
      setState((s) => ({ ...s, loading: false, error: "Ayar kaydedilemedi" }));
      return;
    }

    setCurrentUrl(url);
    setState((s) => ({ ...s, loading: false, success: true }));
    setTimeout(() => setState((s) => ({ ...s, success: false })), 3000);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isWide = item.recommendedSize.startsWith("1920");
  const aspectRatio = isWide ? "1920/600" : "1/1";

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Başlık */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
          {item.hint && <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>}
        </div>
        <span className="text-xs bg-honey-cream text-honey-dark font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
          {item.recommendedSize}
        </span>
      </div>

      {/* Önizleme */}
      <div
        className="relative w-full bg-gray-50 border-b border-gray-100"
        style={{ aspectRatio }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {currentUrl ? (
          <Image src={currentUrl} alt={item.label} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
            <ImageOff size={24} />
            <span className="text-xs">Görsel yok</span>
          </div>
        )}
        {state.loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-7 h-7 border-4 border-honey border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Alt */}
      <div className="px-4 py-3 space-y-2">
        {state.resolutionWarning && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs">
            <AlertTriangle size={13} className="shrink-0" />{state.resolutionWarning}
          </div>
        )}
        {state.error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-xs">
            <AlertTriangle size={13} className="shrink-0" />{state.error}
          </div>
        )}
        {state.success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-xs">
            <CheckCircle size={13} className="shrink-0" />Güncellendi
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleChange} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={state.loading}
            className="flex items-center gap-1.5 bg-honey-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-honey-medium transition-colors disabled:opacity-50"
          >
            <Upload size={13} />
            {currentUrl ? "Değiştir" : "Yükle"}
          </button>
          <span className="text-xs text-gray-400">Sürükle-bırak · Max 5MB</span>
        </div>
      </div>
    </div>
  );
}

export function BannerManager({ groups }: Props) {
  return (
    <div className="space-y-10">
      {/* Genel kural */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle size={17} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-bold">Kural:</span> Banner görselleri{" "}
          <span className="font-mono font-bold">1920 × 600 px</span>, slider görselleri{" "}
          <span className="font-mono font-bold">1920 × 700 px</span>, kare görseller{" "}
          <span className="font-mono font-bold">400 × 400 px</span> olmalıdır.
          Farklı boyut yüklerseniz uyarı alırsınız ama yükleme engellenmez.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.title}>
          <div className="mb-4">
            <h2 className="text-base font-black text-gray-900">{group.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
          </div>
          <div className={`grid gap-4 ${group.items.length > 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            {group.items.map((item) => (
              <ImageCard key={item.key} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
