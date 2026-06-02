"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ParentRole { id: string; name: string; }

export function NewRoleForm({ parentRoles }: { parentRoles: ParentRole[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    setSlug(v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, color, parentId: parentId || undefined }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Hata oluştu"); setLoading(false); return; }
    router.push(`/admin/roles/${data.id}`);
  }

  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className={label}>Rol Adı *</label>
        <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className={input} />
      </div>
      <div>
        <label className={label}>Slug *</label>
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="^[a-z_]+"
          className={`${input} font-mono`} placeholder="ornek_rol" />
        <p className="text-xs text-gray-400 mt-1">Sadece küçük harf ve alt çizgi</p>
      </div>
      <div>
        <label className={label}>Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Renk</label>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
              className={`flex-1 ${input} font-mono`} />
          </div>
        </div>
        <div>
          <label className={label}>Üst Rol (isteğe bağlı)</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={input}>
            <option value="">Yok</option>
            {parentRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">İptal</button>
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
          {loading ? "Oluşturuluyor..." : "Rol Oluştur"}
        </button>
      </div>
    </form>
  );
}
