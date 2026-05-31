"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Check } from "lucide-react";

interface Entity {
  id: string;
  name: string;
  image?: string | null;
  images?: string[];
}

interface Props {
  type: "product" | "category";
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export function EntityPickerDialog({ type, selectedIds, onConfirm, onClose }: Props) {
  const [items, setItems] = useState<Entity[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const inputRef = useRef<HTMLInputElement>(null);

  const apiUrl = type === "product" ? "/api/admin/products" : "/api/admin/categories";
  const title = type === "product" ? "Ürün Seç" : "Kategori Seç";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const url = query ? `${apiUrl}?q=${encodeURIComponent(query)}` : apiUrl;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => {});
    return () => controller.abort();
  }, [query, apiUrl]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getThumb(item: Entity) {
    if (type === "product") return (item.images ?? [])[0] ?? null;
    return item.image ?? null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* Arama */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={type === "product" ? "Ürün adı ara..." : "Kategori adı ara..."}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-honey"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {loading && (
            <div className="text-center py-8 text-sm text-gray-400">Yükleniyor...</div>
          )}
          {!loading && items.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">Sonuç bulunamadı</div>
          )}
          {!loading && items.map((item) => {
            const isSelected = selected.has(item.id);
            const thumb = getThumb(item);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  isSelected ? "bg-honey/10 border border-honey/30" : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Ad + ID */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{item.id}</p>
                </div>

                {/* Checkmark */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? "bg-honey border-honey" : "border-gray-300"
                }`}>
                  {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50/50 rounded-b-2xl">
          <span className="text-xs text-gray-500">
            {selected.size} seçili
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              İptal
            </button>
            <button
              onClick={() => { onConfirm(Array.from(selected)); onClose(); }}
              className="px-4 py-2 text-sm bg-honey text-white rounded-xl font-medium hover:bg-honey-dark"
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
