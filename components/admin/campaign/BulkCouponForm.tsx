"use client";

import { useState } from "react";

export function BulkCouponForm() {
  const [form, setForm] = useState({
    count: 10,
    prefix: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: "",
    maxUses: "1",
    expiresAt: "",
  });
  const [result, setResult] = useState<{ created: number; codes: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/admin/coupons/bulk-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        count: Number(form.count),
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Hata oluştu");
      return;
    }
    const data = await res.json();
    setResult(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Adet</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={form.count}
            onChange={(e) => setForm((f) => ({ ...f, count: Number(e.target.value) }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Önek (opsiyonel)</label>
          <input
            value={form.prefix}
            onChange={(e) => setForm((f) => ({ ...f, prefix: e.target.value.toUpperCase() }))}
            placeholder="YAZ"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">İndirim Tipi</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Yüzde (%)</option>
            <option value="FIXED">Sabit (TL)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            İndirim Değeri {form.discountType === "PERCENTAGE" ? "(%)" : "(TL)"}
          </label>
          <input
            type="number"
            min={1}
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min. Sipariş (TL)</label>
          <input
            type="number"
            value={form.minOrderAmount}
            onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
            placeholder="Yok"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kullanım Limiti</label>
          <input
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Son Kullanma Tarihi</label>
        <input
          type="datetime-local"
          value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-bold text-green-800">{result.created} kupon oluşturuldu!</p>
          <div className="mt-2 max-h-32 overflow-y-auto">
            <p className="text-xs font-mono text-green-700">{result.codes.slice(0, 20).join(", ")}{result.codes.length > 20 ? ` ...ve ${result.codes.length - 20} daha` : ""}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark disabled:opacity-50"
      >
        {loading ? "Üretiliyor..." : "Kupon Üret"}
      </button>
    </form>
  );
}
