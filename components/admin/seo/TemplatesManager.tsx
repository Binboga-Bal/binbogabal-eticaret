"use client";

import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";

interface Template {
  id: string;
  name: string;
  entityType: string;
  locale: string;
  titlePattern: string;
  descPattern: string;
  isDefault: boolean;
}

export function TemplatesManager({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", entityType: "product", locale: "tr", titlePattern: "{{name}} | Binboğa Kooperatif Balı", descPattern: "{{name}} satın al. Doğal ve analizi yapılmış kooperatif balı.", isDefault: false });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error ?? "Hata"); return; }
      const created = await res.json();
      setTemplates((prev) => [...prev, created]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/seo/templates/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700">
          <Plus size={15} /> Yeni Şablon
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Yeni Şablon</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Ad</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Tip</label>
              <select value={form.entityType} onChange={(e) => setForm((f) => ({ ...f, entityType: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="product">Ürün</option>
                <option value="category">Kategori</option>
                <option value="blog">Blog</option>
                <option value="campaign">Kampanya</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Dil</label>
              <select value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Title Pattern</label>
            <input value={form.titlePattern} onChange={(e) => setForm((f) => ({ ...f, titlePattern: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Description Pattern</label>
            <input value={form.descPattern} onChange={(e) => setForm((f) => ({ ...f, descPattern: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
              Varsayılan şablon
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3 py-1.5 border rounded-lg hover:bg-gray-50">İptal</button>
              <button onClick={save} disabled={saving || !form.name} className="text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:bg-violet-700 disabled:opacity-50">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dil</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title Pattern</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  {t.isDefault && <Star size={13} className="text-amber-400 fill-amber-400" />}
                  {t.name}
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.entityType}</span></td>
                <td className="px-4 py-3 uppercase text-xs text-gray-500">{t.locale}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate">{t.titlePattern}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(t.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz şablon yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
