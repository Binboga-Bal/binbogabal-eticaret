"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
        <p className="text-sm text-gray-500 mb-6">Email adresinizi girin, şifre sıfırlama linki gönderilecek.</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            Eğer bu email kayıtlıysa sıfırlama maili gönderildi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="admin@binbogabal.com.tr"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
            </button>
          </form>
        )}

        <a href="/admin/auth/login" className="block text-center mt-4 text-sm text-gray-500 hover:underline">
          Girişe dön
        </a>
      </div>
    </div>
  );
}
