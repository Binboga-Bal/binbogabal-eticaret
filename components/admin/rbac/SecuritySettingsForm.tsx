"use client";

import { useState } from "react";

interface Policy {
  id?: string;
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expiryDays: number | null;
  maxFailedAttempts: number;
  lockoutDuration: number;
  sessionTimeoutMinutes: number;
  require2FAForRoles: string[];
}

interface GlobalIP { id: string; ipRange: string; label: string | null; }

interface Props {
  policy: Policy | null;
  globalIPs: GlobalIP[];
}

const DEFAULT_POLICY: Policy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,
  expiryDays: null,
  maxFailedAttempts: 5,
  lockoutDuration: 30,
  sessionTimeoutMinutes: 480,
  require2FAForRoles: [],
};

export function SecuritySettingsForm({ policy, globalIPs }: Props) {
  const [form, setForm] = useState<Policy>(policy ?? DEFAULT_POLICY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [forceLoggingOut, setForceLoggingOut] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/security/policy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function forceLogoutAll() {
    if (!confirm("Tüm admin oturumlarını kapatmak istiyor musunuz? (Kendi oturumunuz hariç)")) return;
    setForceLoggingOut(true);
    await fetch("/api/admin/security/force-logout-all", { method: "POST" });
    setForceLoggingOut(false);
    alert("Tüm oturumlar kapatıldı.");
  }

  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Password Policy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Şifre Politikası</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Minimum Uzunluk</label>
            <input type="number" min={6} max={32} value={form.minLength}
              onChange={(e) => setForm({ ...form, minLength: +e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Geçmiş Şifre Önleme</label>
            <input type="number" min={0} max={24} value={form.preventReuse}
              onChange={(e) => setForm({ ...form, preventReuse: +e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Şifre Geçerlilik Süresi (gün, boş = sınırsız)</label>
            <input type="number" min={0} value={form.expiryDays ?? ""}
              onChange={(e) => setForm({ ...form, expiryDays: e.target.value ? +e.target.value : null })} className={input}
              placeholder="Sınırsız" />
          </div>
          <div>
            <label className={label}>Max Başarısız Giriş</label>
            <input type="number" min={3} max={10} value={form.maxFailedAttempts}
              onChange={(e) => setForm({ ...form, maxFailedAttempts: +e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Kilitleme Süresi (dakika)</label>
            <input type="number" min={5} max={1440} value={form.lockoutDuration}
              onChange={(e) => setForm({ ...form, lockoutDuration: +e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Oturum Zaman Aşımı (dakika)</label>
            <input type="number" min={30} max={1440} value={form.sessionTimeoutMinutes}
              onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: +e.target.value })} className={input} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            ["requireUppercase", "Büyük harf zorunlu"],
            ["requireLowercase", "Küçük harf zorunlu"],
            ["requireNumbers", "Rakam zorunlu"],
            ["requireSpecialChars", "Özel karakter zorunlu"],
          ].map(([key, lbl]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[key as keyof Policy] as boolean}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={forceLogoutAll} disabled={forceLoggingOut}
          className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-60">
          {forceLoggingOut ? "Kapatılıyor..." : "🚪 Tüm Oturumları Kapat"}
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
          {saving ? "Kaydediliyor..." : success ? "✅ Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
