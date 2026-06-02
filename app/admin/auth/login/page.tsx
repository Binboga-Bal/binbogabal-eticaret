"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totpCode: requires2FA ? totpCode : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setError("");
        } else {
          setError(data.error ?? "Giriş başarısız");
        }
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        return;
      }

      router.push(data.mustChangePassword ? "/admin/auth/change-password" : from);
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Girişi</h1>
          <p className="text-sm text-gray-500 mt-1">Binboğa Kooperatif Yönetim Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="admin@binbogabal.com.tr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right">
                <a href="/admin/auth/forgot-password" className="text-sm text-amber-600 hover:underline">
                  Şifremi unuttum
                </a>
              </div>
            </>
          ) : (
            <div>
              <div className="text-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Authenticator uygulamanızdaki 6 haneli kodu girin</p>
              </div>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline block mx-auto"
              >
                Geri dön
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : requires2FA ? "Doğrula" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
