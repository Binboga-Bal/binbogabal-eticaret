"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";

const packagingTypes = [
  { value: "GLASS", label: "Cam Kavanoz" },
  { value: "PLASTIC", label: "Plastik Ambalaj" },
];

const sizes = [40, 90, 240, 460, 650, 850, 1000, 1500, 2000];

interface Props {
  honeyTypes: { id: string; slug: string; label: string }[];
}

export function ProductFilter({ honeyTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("sayfa");
      router.push(`/urunlerimiz?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearAll = () => {
    setMinInput("");
    setMaxInput("");
    router.push("/urunlerimiz");
  };

  const [minInput, setMinInput] = useState(searchParams.get("minFiyat") ?? "");
  const [maxInput, setMaxInput] = useState(searchParams.get("maxFiyat") ?? "");

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minInput) params.set("minFiyat", minInput);
    else params.delete("minFiyat");
    if (maxInput) params.set("maxFiyat", maxInput);
    else params.delete("maxFiyat");
    params.delete("sayfa");
    router.push(`/urunlerimiz?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-[130px]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Filtrele</h3>
          <button
            onClick={clearAll}
            className="text-xs text-honey-dark hover:underline"
          >
            Temizle
          </button>
        </div>

        {/* Bal türü */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Bal Türü</h4>
          <div className="grid grid-cols-2 gap-2">
            {honeyTypes.map((t) => {
              const isActive = searchParams.get("tur") === t.slug;
              return (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => setParam("tur", t.slug)}
                  className={`flex items-center justify-center px-2 py-1.5 rounded-xl border-2 text-[11px] font-medium transition-all min-w-0 ${
                    isActive
                      ? "border-honey-dark bg-honey-dark text-white shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-honey-dark hover:text-honey-dark"
                  }`}
                >
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Fiyat Aralığı (₺)
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-honey-dark"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-honey-dark"
            />
          </div>
          <button
            onClick={applyPrice}
            className="w-full py-1.5 rounded-lg bg-honey-dark text-white text-xs font-semibold hover:bg-honey-medium transition-colors"
          >
            Uygula
          </button>
        </div>

        {/* Ambalaj türü */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Ambalaj Türü
          </h4>
          <div className="space-y-1.5">
            {packagingTypes.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={searchParams.get("ambalaj") === t.value}
                  onChange={() => setParam("ambalaj", t.value)}
                  className="accent-honey-dark"
                />
                <span className="text-sm text-gray-600">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ambalaj Boyutu */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Ambalaj Boyutu
          </h4>
          <div className="space-y-1.5 grid grid-cols-2">
            {sizes.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.get("boyut") === String(s)}
                  onChange={() => setParam("boyut", String(s))}
                  className="accent-honey-dark"
                />
                <span className="text-sm text-gray-600">
                  {s >= 1000 ? `${s / 1000} KG` : `${s} GR`}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearAll}
        >
          Filtreleri Temizle
        </Button>
      </div>
    </aside>
  );
}
