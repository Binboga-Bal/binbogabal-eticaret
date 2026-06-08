"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, CheckCircle, AlertTriangle, ImageOff, Save } from "lucide-react";

export interface ImageField {
  key: string;
  label: string;
  hint?: string;
  currentUrl: string | null;
  recommendedSize: string;
}

export interface TextField {
  key: string;
  label: string;
  type: "text" | "textarea";
  defaultValue: string;
  currentValue: string | null;
  placeholder?: string;
  rows?: number;
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  images?: ImageField[];
  texts?: TextField[];
}

interface Props {
  sections: ContentSection[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface UploadState {
  loading: boolean;
  error: string | null;
  success: boolean;
  resolutionWarning: string | null;
}
const INIT: UploadState = { loading: false, error: null, success: false, resolutionWarning: null };

function checkResolution(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(blobUrl); };
    img.src = blobUrl;
  });
}

function parseSize(s: string) {
  const m = s.match(/(\d+)\s*[×x]\s*(\d+)/);
  return m ? { width: +m[1], height: +m[2] } : null;
}

function Alert({ type, children }: { type: "warn" | "error" | "ok"; children: React.ReactNode }) {
  const cls = { warn: "text-amber-600 bg-amber-50", error: "text-red-600 bg-red-50", ok: "text-green-600 bg-green-50" }[type];
  const Icon = type === "ok" ? CheckCircle : AlertTriangle;
  return (
    <div className={`flex items-center gap-2 ${cls} px-3 py-2 rounded-lg text-xs`}>
      <Icon size={13} className="shrink-0" />{children}
    </div>
  );
}

// ── Image Card ────────────────────────────────────────────────────────────────

function ImageCard({ item }: { item: ImageField }) {
  const [url, setUrl] = useState<string | null>(item.currentUrl);
  const [st, setSt] = useState<UploadState>(INIT);
  const inputRef = useRef<HTMLInputElement>(null);
  const rec = parseSize(item.recommendedSize);
  const isWide = item.recommendedSize.startsWith("1920");

  async function handleFile(file: File) {
    setSt(INIT);
    const { width, height } = await checkResolution(file);
    const resolutionWarning = rec && (width !== rec.width || height !== rec.height)
      ? `Görsel ${width}×${height} px — önerilen ${item.recommendedSize}` : null;
    setSt((s) => ({ ...s, resolutionWarning, loading: true }));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images/site-gorseller");

    const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!upRes.ok) {
      const { error } = await upRes.json().catch(() => ({ error: "Yükleme başarısız" }));
      setSt((s) => ({ ...s, loading: false, error }));
      return;
    }
    const { url: newUrl } = await upRes.json();

    const saveRes = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [item.key]: newUrl }),
    });
    if (!saveRes.ok) {
      setSt((s) => ({ ...s, loading: false, error: "Ayar kaydedilemedi" }));
      return;
    }
    setUrl(newUrl);
    setSt((s) => ({ ...s, loading: false, success: true }));
    setTimeout(() => setSt((s) => ({ ...s, success: false })), 3000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
          {item.hint && <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>}
        </div>
        <span className="text-xs bg-honey-cream text-honey-dark font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
          {item.recommendedSize}
        </span>
      </div>

      <div
        className="relative w-full bg-gray-50 border-b border-gray-100"
        style={{ aspectRatio: isWide ? "1920/600" : "1/1" }}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
      >
        {url ? (
          <Image src={url} alt={item.label} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
            <ImageOff size={24} />
            <span className="text-xs">Görsel yok</span>
          </div>
        )}
        {st.loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-7 h-7 border-4 border-honey border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-2">
        {st.resolutionWarning && <Alert type="warn">{st.resolutionWarning}</Alert>}
        {st.error && <Alert type="error">{st.error}</Alert>}
        {st.success && <Alert type="ok">Güncellendi</Alert>}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={st.loading}
            className="flex items-center gap-1.5 bg-honey-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-honey-medium transition-colors disabled:opacity-50"
          >
            <Upload size={13} />{url ? "Değiştir" : "Yükle"}
          </button>
          <span className="text-xs text-gray-400">Sürükle-bırak · Max 5MB</span>
        </div>
      </div>
    </div>
  );
}

// ── Text Card ─────────────────────────────────────────────────────────────────

function TextCard({ field }: { field: TextField }) {
  const initial = field.currentValue ?? field.defaultValue;
  const [savedVal, setSavedVal] = useState(initial);
  const [val, setVal] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const dirty = val !== savedVal;

  async function save() {
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field.key]: val }),
    });
    setSaving(false);
    if (!res.ok) { setErr("Kaydedilemedi"); return; }
    setSavedVal(val);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-gray-800 text-sm">{field.label}</label>
        {field.type === "text" && <span className="text-xs text-gray-400">{val.length} kr.</span>}
      </div>

      {field.type === "textarea" ? (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey/40 resize-y"
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={field.placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey/40"
        />
      )}

      {err && <Alert type="error">{err}</Alert>}
      {ok && <Alert type="ok">Kaydedildi</Alert>}

      <button
        onClick={save}
        disabled={saving || !dirty}
        className="flex items-center gap-1.5 bg-honey-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-honey-medium transition-colors disabled:opacity-50"
      >
        {saving
          ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Save size={13} />}
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function PageContentManager({ sections }: Props) {
  return (
    <div className="space-y-12">
      {sections.map((sec) => (
        <section key={sec.id}>
          <div className="mb-5">
            <h2 className="text-base font-black text-gray-900">{sec.title}</h2>
            {sec.description && <p className="text-xs text-gray-500 mt-0.5">{sec.description}</p>}
          </div>

          <div className="space-y-6">
            {sec.images && sec.images.length > 0 && (
              <div className={`grid gap-4 ${sec.images.length > 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {sec.images.map((img) => <ImageCard key={img.key} item={img} />)}
              </div>
            )}
            {sec.texts && sec.texts.length > 0 && (
              <div className={`grid gap-4 ${sec.texts.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {sec.texts.map((f) => <TextCard key={f.key} field={f} />)}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
