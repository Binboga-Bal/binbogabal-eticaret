"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [info, setInfo] = useState<{ email: string; name: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setInvalid(true); return; }
    fetch(`/api/admin/auth/accept-invite?token=${token}`)
      .then((r) => r.json())
      .then((d) => { if (d.email) { setInfo(d); setName(d.name ?? ""); } else setInvalid(true); })
      .catch(() => setInvalid(true));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, name }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/admin/auth/login?invited=success");
  }

  if (invalid) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl p-8 text-center max-w-md">
        <p className="text-red-600 font-medium">Geçersiz veya süresi dolmuş davet linki.</p>
        <a href="/admin/auth/login" className="mt-4 block text-sm text-amber-600 hover:underline">Girişe dön</a>
      </div>
    </div>
  );

  if (!info) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Daveti Kabul Et</h1>
        <p className="text-sm text-gray-500 mb-6">{info.email} — Şifrenizi belirleyin</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Adınız Soyadınız" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Şifre" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Şifre (tekrar)" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? "Kaydediliyor..." : "Hesabımı Aktifleştir"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return <Suspense fallback={null}><AcceptInviteForm /></Suspense>;
}
