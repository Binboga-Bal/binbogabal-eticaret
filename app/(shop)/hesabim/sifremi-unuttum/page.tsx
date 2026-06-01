export const dynamic = "force-dynamic";
"use client";

import { useState } from "react";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { setError("Bir hata oluştu"); return; }
    setSent(true);
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Şifremi Unuttum</h1>
      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-4">
          <p className="text-green-800 text-sm">
            Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta Adresi</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
