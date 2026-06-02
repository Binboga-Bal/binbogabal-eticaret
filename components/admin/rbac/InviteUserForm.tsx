"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export function InviteUserForm({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleRole(id: string) {
    setSelectedRoles((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRoles.length === 0) { setError("En az bir rol seçin"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, department, phone, roleIds: selectedRoles }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Hata oluştu"); setLoading(false); return; }
    setSuccess(true);
  }

  if (success) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p className="text-green-700 font-medium">Davet maili gönderildi! ✅</p>
      <button onClick={() => { setSuccess(false); setEmail(""); setName(""); setSelectedRoles([]); }}
        className="mt-4 text-sm text-green-600 hover:underline">Yeni davet gönder</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roller *</label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)}
                className="rounded" />
              <span className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color ?? "#6b7280" }} />
                {role.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
          {loading ? "Gönderiliyor..." : "Davet Gönder"}
        </button>
      </div>
    </form>
  );
}
