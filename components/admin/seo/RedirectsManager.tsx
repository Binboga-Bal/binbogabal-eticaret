"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import Link from "next/link";
import { Toggle } from "@/components/ui/Toggle";

interface RedirectItem {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  hitCount: number;
  note?: string | null;
  createdAt: string;
}

interface Props {
  initialItems: RedirectItem[];
  total: number;
  page: number;
  q: string;
}

export function RedirectsManager({ initialItems, total, page, q }: Props) {
  const [items, setItems] = useState(initialItems);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newCode, setNewCode] = useState("301");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  const add = async () => {
    if (!newFrom || !newTo) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPath: newFrom, toPath: newTo, statusCode: parseInt(newCode) }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Hata");
        return;
      }
      const created = await res.json();
      setItems((prev) => [{ ...created, createdAt: created.createdAt }, ...prev]);
      setNewFrom("");
      setNewTo("");
      setShowForm(false);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Bu yönlendirmeyi silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/admin/seo/redirects/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/seo/redirects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) setItems((prev) => prev.map((i) => i.id === id ? { ...i, isActive } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Yolu ara..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
          <button type="submit" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg">Ara</button>
        </form>
        <div className="flex gap-2">
          <Link href="/api/admin/seo/redirects/detect-chains" className="text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            Zincirleri Tespit Et
          </Link>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700">
            <Plus size={15} /> Yeni Ekle
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Yeni Yönlendirme</h3>
          <div className="flex gap-3">
            <input value={newFrom} onChange={(e) => setNewFrom(e.target.value)} placeholder="/eski-yol" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <span className="flex items-center text-gray-400">→</span>
            <input value={newTo} onChange={(e) => setNewTo(e.target.value)} placeholder="/yeni-yol" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <select value={newCode} onChange={(e) => setNewCode(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="301">301 Kalıcı</option>
              <option value="302">302 Geçici</option>
              <option value="307">307 Temp</option>
              <option value="308">308 Perm</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3 py-1.5 border rounded-lg hover:bg-gray-50"><X size={14} /></button>
            <button onClick={add} disabled={adding || !newFrom || !newTo} className="text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {adding ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">{total} kayıt</div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kaynak</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hedef</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Kod</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Tıklanma</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Aktif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-xs truncate">{item.fromPath}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{item.toPath}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{item.statusCode}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">{item.hitCount}</td>
                <td className="px-4 py-3 text-center">
                  <Toggle checked={item.isActive} onChange={(v) => toggle(item.id, v)} size="sm" />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Yönlendirme kaydı yok</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Sayfa {page} / {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}&q=${q}`} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">Önceki</Link>}
            {page < totalPages && <Link href={`?page=${page + 1}&q=${q}`} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">Sonraki</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
