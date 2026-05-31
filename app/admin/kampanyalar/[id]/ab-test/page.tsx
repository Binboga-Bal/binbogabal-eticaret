"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FlaskConical, Trophy } from "lucide-react";

interface ABTest {
  id: string;
  variantName: string;
  trafficSplit: number;
  discountValue: number;
  impressions: number;
  conversions: number;
  revenue: number;
  isWinner: boolean;
}

export default function ABTestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [form, setForm] = useState({ variantName: "", trafficSplit: 50, discountValue: 10 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/campaigns/${id}/ab-tests`)
      .then((r) => r.json())
      .then(setTests);
  }, [id]);

  async function addVariant() {
    setSaving(true);
    const res = await fetch(`/api/admin/campaigns/${id}/ab-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const test = await res.json();
    setTests((prev) => [...prev, test]);
    setForm({ variantName: "", trafficSplit: 50, discountValue: 10 });
    setSaving(false);
  }

  async function declareWinner(variantId: string) {
    await fetch(`/api/admin/campaigns/${id}/ab-tests/declare-winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId }),
    });
    router.refresh();
    setTests((prev) => prev.map((t) => ({ ...t, isWinner: t.id === variantId })));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FlaskConical size={20} className="text-purple-600" />
        <h1 className="text-xl font-black text-gray-900">A/B Test Yönetimi</h1>
      </div>

      {/* Mevcut varyantlar */}
      {tests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b font-bold text-gray-800">Varyantlar</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Varyant</th>
                <th className="px-4 py-3 text-right">Trafik %</th>
                <th className="px-4 py-3 text-right">İndirim</th>
                <th className="px-4 py-3 text-right">Görüntülenme</th>
                <th className="px-4 py-3 text-right">Dönüşüm</th>
                <th className="px-4 py-3 text-right">CVR</th>
                <th className="px-4 py-3 text-right">Kazanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tests.map((t) => (
                <tr key={t.id} className={t.isWinner ? "bg-green-50" : ""}>
                  <td className="px-5 py-3 font-semibold">{t.variantName}</td>
                  <td className="px-4 py-3 text-right">%{t.trafficSplit}</td>
                  <td className="px-4 py-3 text-right">%{t.discountValue}</td>
                  <td className="px-4 py-3 text-right font-mono">{t.impressions}</td>
                  <td className="px-4 py-3 text-right font-mono">{t.conversions}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {t.impressions > 0 ? `${((t.conversions / t.impressions) * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.isWinner ? (
                      <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                        <Trophy size={13} /> Kazanan
                      </span>
                    ) : (
                      <button
                        onClick={() => declareWinner(t.id)}
                        className="text-xs text-purple-600 hover:underline"
                      >
                        Kazanan Seç
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni varyant ekle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">Yeni Varyant Ekle</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Varyant Adı</label>
            <input
              value={form.variantName}
              onChange={(e) => setForm((f) => ({ ...f, variantName: e.target.value }))}
              placeholder="A, B, C..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Trafik Payı (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.trafficSplit}
              onChange={(e) => setForm((f) => ({ ...f, trafficSplit: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">İndirim Oranı (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={addVariant}
          disabled={saving || !form.variantName}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? "Ekleniyor..." : "Varyant Ekle"}
        </button>
      </div>
    </div>
  );
}
