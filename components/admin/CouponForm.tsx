"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CouponForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "", discountType: "PERCENTAGE", discountValue: 10,
    minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: form.code.toUpperCase(),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    });

    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }

    router.refresh();
    setForm({ code: "", discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Kupon Kodu" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="YILBASI25" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Türü</label>
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
          >
            <option value="PERCENTAGE">Yüzde (%)</option>
            <option value="FIXED">Sabit Tutar (₺)</option>
            <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
          </select>
        </div>
        {form.discountType !== "FREE_SHIPPING" && (
          <Input label={form.discountType === "PERCENTAGE" ? "İndirim %" : "İndirim ₺"}
            type="number" value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) })} required
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Min. Sipariş (₺)" type="number" value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="Yok"
        />
        <Input label="Maks. Kullanım" type="number" value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Sınırsız"
        />
      </div>

      <Input label="Bitiş Tarihi" type="date" value={form.expiresAt}
        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-honey-dark" />
        <span className="text-sm text-gray-700">Aktif</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={saving} className="w-full">Kupon Oluştur</Button>
    </form>
  );
}
