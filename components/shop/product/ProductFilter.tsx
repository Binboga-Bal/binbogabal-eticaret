"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";

const honeyTypes = [
  { value: "CAM", label: "Çam Balı" },
  { value: "KEVEN_KEKIK", label: "Keven & Kekik Balı" },
  { value: "NARENCIYE", label: "Narenciye Balı" },
  { value: "CICEK", label: "Çiçek Balı" },
  { value: "OZEL", label: "Özel Ürünler" },
];

const packagingTypes = [
  { value: "GLASS", label: "Cam Kavanoz" },
  { value: "PLASTIC", label: "Plastik Ambalaj" },
];

const sizes = [40, 90, 240, 460, 650, 850, 1000, 1500, 2000];

export function ProductFilter() {
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
      router.push(`/urunlerimiz?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => router.push("/urunlerimiz");

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Filtrele</h3>
          <button onClick={clearAll} className="text-xs text-honey-dark hover:underline">
            Temizle
          </button>
        </div>

        {/* Bal türü */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Bal Türü</h4>
          <div className="space-y-1.5">
            {honeyTypes.map((t) => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.get("tur") === t.value}
                  onChange={() => setParam("tur", t.value)}
                  className="accent-honey-dark"
                />
                <span className="text-sm text-gray-600">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ambalaj türü */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ambalaj Türü</h4>
          <div className="space-y-1.5">
            {packagingTypes.map((t) => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
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
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ambalaj Boyutu</h4>
          <div className="space-y-1.5">
            {sizes.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.get("boyut") === String(s)}
                  onChange={() => setParam("boyut", String(s))}
                  className="accent-honey-dark"
                />
                <span className="text-sm text-gray-600">{s >= 1000 ? `${s / 1000} KG` : `${s} GR`}</span>
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
