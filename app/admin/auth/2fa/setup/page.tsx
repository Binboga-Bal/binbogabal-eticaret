"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TwoFASetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"start" | "qr" | "verify" | "backup">("start");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setLoading(true);
    const res = await fetch("/api/admin/auth/2fa/setup", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setQrCode(data.qrCode);
    setSecret(data.secret);
    setStep("qr");
    setLoading(false);
  }

  async function verifyCode() {
    if (code.length !== 6) { setError("6 haneli kod girin"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setBackupCodes(data.backupCodes);
    setStep("backup");
    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">2FA Kurulumu</h1>

      {step === "start" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">İki Faktörlü Kimlik Doğrulama</h2>
          <p className="text-sm text-gray-500 mb-6">Google Authenticator veya Authy ile her girişte 6 haneli kod kullanın.</p>
          <button onClick={startSetup} disabled={loading}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? "Hazırlanıyor..." : "2FA Kurulumunu Başlat"}
          </button>
        </div>
      )}

      {step === "qr" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">1. QR Kodu Tarayın</h2>
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-lg" />
          </div>
          <p className="text-xs text-center text-gray-500 mb-4">
            Kodu okuyamıyorsanız manuel girin: <code className="bg-gray-100 px-1 py-0.5 rounded">{secret}</code>
          </p>
          <h2 className="font-semibold mb-3">2. Kodu Doğrulayın</h2>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="000000" />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button onClick={verifyCode} disabled={loading || code.length !== 6}
            className="w-full mt-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? "Doğrulanıyor..." : "Doğrula ve Aktifleştir"}
          </button>
        </div>
      )}

      {step === "backup" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-semibold text-green-700">2FA Aktifleştirildi!</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Aşağıdaki yedek kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-sm font-mono bg-white border border-gray-200 rounded px-3 py-1.5 text-center">
                  {code}
                </code>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const text = backupCodes.join("\n");
              navigator.clipboard.writeText(text);
            }}
            className="w-full mb-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Kopyala
          </button>
          <button onClick={() => router.push("/admin")}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg transition">
            Tamamlandı
          </button>
        </div>
      )}
    </div>
  );
}
