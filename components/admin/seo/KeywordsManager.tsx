"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  locale: string;
  country: string;
  targetUrl: string | null;
  isActive: boolean;
  rankings: { position: number | null; previousPos: number | null; recordedAt: string }[];
}

export function KeywordsManager({ initialKeywords }: { initialKeywords: Keyword[] }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKw, setNewKw] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const add = async () => {
    if (!newKw) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKw, targetUrl: newUrl || null }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error ?? "Hata"); return; }
      const created = await res.json();
      setKeywords((prev) => [{ ...created, rankings: [] }, ...prev]);
      setNewKw("");
      setNewUrl("");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/seo/keywords/${id}`, { method: "DELETE" });
    if (res.ok) setKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const trend = (kw: Keyword) => {
    const latest = kw.rankings[0];
    if (!latest?.position || !latest.previousPos) return <Minus size={14} className="text-gray-400" />;
    if (latest.position < latest.previousPos) return <TrendingUp size={14} className="text-green-500" />;
    if (latest.position > latest.previousPos) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input value={newKw} onChange={(e) => setNewKw(e.target.value)} placeholder="Anahtar kelime..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" onKeyDown={(e) => e.key === "Enter" && add()} />
        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="/hedef-sayfa (opsiyonel)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
        <button onClick={add} disabled={adding || !newKw} className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50">
          <Plus size={15} /> Ekle
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kelime</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hedef URL</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Pozisyon</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Trend</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {keywords.map((kw) => (
              <tr key={kw.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{kw.keyword}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{kw.targetUrl ?? "-"}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-700">
                  {kw.rankings[0]?.position ?? "-"}
                </td>
                <td className="px-4 py-3 text-center">{trend(kw)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(kw.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz kelime eklenmedi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
