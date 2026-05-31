"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { EntityPickerDialog } from "@/components/admin/campaign-builder/EntityPickerDialog";

export interface VolumeTier {
  minQty: number;
  discountPercent: number;
}

export interface VolumeProduct {
  id: string;
  productId: string;
  product: { id: string; name: string; images: string[] };
}

export interface VolumeRule {
  id: string;
  name: string;
  isActive: boolean;
  tiers: VolumeTier[];
  products: VolumeProduct[];
}

const EMPTY_RULE = (): Omit<VolumeRule, "id"> => ({
  name: "",
  isActive: true,
  tiers: [{ minQty: 3, discountPercent: 5 }],
  products: [],
});

export function VolumeDiscountManager({ initialRules }: { initialRules: VolumeRule[] }) {
  const [rules, setRules] = useState<VolumeRule[]>(initialRules);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<VolumeRule, "id">>(EMPTY_RULE());
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openNew() {
    setForm(EMPTY_RULE());
    setEditId("new");
  }

  function openEdit(rule: VolumeRule) {
    setForm({ name: rule.name, isActive: rule.isActive, tiers: rule.tiers, products: rule.products });
    setEditId(rule.id);
  }

  function cancelEdit() {
    setEditId(null);
  }

  // Kademeler
  function addTier() {
    const last = form.tiers[form.tiers.length - 1];
    setForm((f) => ({
      ...f,
      tiers: [...f.tiers, { minQty: (last?.minQty ?? 0) + 2, discountPercent: (last?.discountPercent ?? 0) + 5 }],
    }));
  }

  function updateTier(i: number, patch: Partial<VolumeTier>) {
    setForm((f) => ({ ...f, tiers: f.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));
  }

  function removeTier(i: number) {
    setForm((f) => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) }));
  }

  // Ürünler
  function handlePickerConfirm(ids: string[]) {
    // ids'i mevcut products formatına çevir — isimler sonraki API çağrısından gelecek
    // Sadece id kaydet, render için local state'ten okuruz
    setForm((f) => ({
      ...f,
      products: ids.map((productId) => {
        const existing = f.products.find((p) => p.productId === productId);
        return existing ?? ({ id: productId, productId, product: { id: productId, name: productId, images: [] } } as VolumeProduct);
      }),
    }));
  }

  async function save() {
    if (!form.name || !form.tiers.length) return;
    setSaving(true);

    const sortedTiers = [...form.tiers].sort((a, b) => a.minQty - b.minQty);
    const payload = {
      name: form.name,
      isActive: form.isActive,
      tiers: sortedTiers,
      productIds: form.products.map((p) => p.productId),
    };

    const isNew = editId === "new";
    const url = isNew ? "/api/admin/volume-discounts" : `/api/admin/volume-discounts/${editId}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved: VolumeRule = await res.json();
      setRules((prev) =>
        isNew ? [saved, ...prev] : prev.map((r) => (r.id === saved.id ? saved : r))
      );
      setEditId(null);
    }
    setSaving(false);
  }

  async function deleteRule(id: string) {
    if (!confirm("Bu kuralı silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/volume-discounts/${id}`, { method: "DELETE" });
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  async function toggleActive(rule: VolumeRule) {
    const res = await fetch(`/api/admin/volume-discounts/${rule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rule.name,
        isActive: !rule.isActive,
        tiers: rule.tiers,
        productIds: rule.products.map((p) => p.productId),
      }),
    });
    if (res.ok) {
      const updated: VolumeRule = await res.json();
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  }

  return (
    <div className="space-y-4">
      {/* Yeni kural butonu */}
      {editId !== "new" && (
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark"
        >
          <Plus size={15} /> Yeni Kural Ekle
        </button>
      )}

      {/* Yeni / Düzenleme formu */}
      {editId !== null && (
        <div className="bg-white rounded-2xl border-2 border-honey/30 p-6 space-y-5">
          <h2 className="font-bold text-gray-900">{editId === "new" ? "Yeni Kural" : "Kuralı Düzenle"}</h2>

          {/* Ad + aktif */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Kural Adı *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Toplu Alım İndirimi"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-honey w-4 h-4"
              />
              Aktif
            </label>
          </div>

          {/* Kademeler */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">İndirim Kademeleri</label>
              <button onClick={addTier} className="flex items-center gap-1 text-xs text-honey-dark hover:underline">
                <Plus size={12} /> Kademe Ekle
              </button>
            </div>
            <div className="space-y-2">
              {form.tiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                  <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-gray-500 whitespace-nowrap">En az</span>
                    <input
                      type="number"
                      min={1}
                      value={tier.minQty}
                      onChange={(e) => updateTier(i, { minQty: Number(e.target.value) })}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-honey"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">ürün alınırsa</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tier.discountPercent}
                      onChange={(e) => updateTier(i, { discountPercent: Number(e.target.value) })}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-honey"
                    />
                    <span className="text-xs text-gray-500">% indirim</span>
                  </div>
                  <button onClick={() => removeTier(i)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            {form.tiers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Henüz kademe eklenmedi.</p>
            )}
          </div>

          {/* Ürünler */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-medium text-gray-600">Kapsanan Ürünler</label>
                <p className="text-[10px] text-gray-400 mt-0.5">Boş bırakılırsa tüm ürünler geçerli olur.</p>
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 text-xs text-honey-dark border border-honey/30 px-2.5 py-1.5 rounded-lg hover:bg-honey-cream/30"
              >
                <Plus size={12} /> Ürün Seç
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.products.map((p) => (
                <div key={p.productId} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  {p.product.images?.[0] && (
                    <Image src={p.product.images[0]} alt="" width={20} height={20} className="rounded object-cover" />
                  )}
                  <span className="text-xs text-gray-700">{p.product.name !== p.productId ? p.product.name : `Ürün …${p.productId.slice(-6)}`}</span>
                  <button
                    onClick={() => setForm((f) => ({ ...f, products: f.products.filter((x) => x.productId !== p.productId) }))}
                    className="text-gray-300 hover:text-red-500 ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {form.products.length === 0 && (
                <span className="text-xs text-gray-400 italic">Tüm ürünler</span>
              )}
            </div>
          </div>

          {/* Kaydet / İptal */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving || !form.name || !form.tiers.length}
              className="flex items-center gap-2 px-5 py-2.5 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark disabled:opacity-50"
            >
              <Check size={14} /> {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={cancelEdit} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Mevcut kurallar */}
      {rules.length === 0 && editId === null && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          Henüz kural yok. İlk kuralı oluşturun.
        </div>
      )}

      {rules.map((rule) => {
        const tiers = rule.tiers as VolumeTier[];
        const isExpanded = expandedId === rule.id;
        return (
          <div key={rule.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Aktif toggle */}
              <button
                onClick={() => toggleActive(rule)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  rule.isActive ? "border-green-500 bg-green-500" : "border-gray-300"
                }`}
                title={rule.isActive ? "Aktif — devre dışı bırak" : "Pasif — aktif et"}
              >
                {rule.isActive && <Check size={10} className="text-white" strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{rule.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tiers.map((t) => `${t.minQty}+ ürün → %${t.discountPercent}`).join(" · ")}
                  {" · "}
                  {rule.products.length > 0 ? `${rule.products.length} ürün` : "Tüm ürünler"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <button
                  onClick={() => openEdit(rule)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-honey-dark"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/30 space-y-3">
                {/* Kademe tablosu */}
                <div className="flex gap-2 flex-wrap">
                  {tiers.map((t, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-lg font-black text-honey-dark">%{t.discountPercent}</p>
                      <p className="text-xs text-gray-500">{t.minQty}+ ürün</p>
                    </div>
                  ))}
                </div>
                {/* Ürün listesi */}
                {rule.products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rule.products.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5">
                        {p.product.images?.[0] && (
                          <Image src={p.product.images[0]} alt="" width={18} height={18} className="rounded object-cover" unoptimized />
                        )}
                        <span className="text-xs text-gray-600">{p.product.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {pickerOpen && (
        <EntityPickerDialog
          type="product"
          selectedIds={form.products.map((p) => p.productId)}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
