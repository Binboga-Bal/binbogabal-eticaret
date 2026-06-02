"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifre Değiştir</h1>
        <p className="text-sm text-gray-500 mb-6">Güvenliğiniz için şifrenizi güncellemeniz gerekiyor.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Mevcut şifre" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Yeni şifre" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Yeni şifre (tekrar)" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? "Kaydediliyor..." : "Şifremi Değiştir"}
          </button>
        </form>
      </div>
    </div>
  );
}
