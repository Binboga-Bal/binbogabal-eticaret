"use client";

import { useState } from "react";
import { RefreshCw, Package, BarChart2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

const syncOptions = [
  { key: "products", label: "Ürünleri Senkronize Et", icon: <Package size={16} /> },
  { key: "stock", label: "Stokları Güncelle", icon: <BarChart2 size={16} /> },
  { key: "orders", label: "Siparişleri Gönder", icon: <ShoppingBag size={16} /> },
];

export function ErpSyncButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  async function handleSync(key: string) {
    setLoading(key);
    setResults((r) => ({ ...r, [key]: "" }));

    const res = await fetch(`/api/admin/erp?type=${key}`, { method: "POST" });
    const data = await res.json();

    setResults((r) => ({
      ...r,
      [key]: data.message ?? (data.error ? `Hata: ${data.error}` : "Tamamlandı"),
    }));
    setLoading(null);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {syncOptions.map((opt) => (
        <div key={opt.key} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-honey-cream rounded-xl text-honey-dark">{opt.icon}</div>
            <h3 className="font-semibold text-gray-800 text-sm">{opt.label}</h3>
          </div>
          {results[opt.key] && (
            <p className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">{results[opt.key]}</p>
          )}
          <Button
            size="sm"
            variant="outline"
            loading={loading === opt.key}
            onClick={() => handleSync(opt.key)}
            className="w-full gap-2"
          >
            <RefreshCw size={14} />
            Başlat
          </Button>
        </div>
      ))}
    </div>
  );
}
