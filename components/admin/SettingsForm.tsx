"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Setting { key: string; label: string; value: string; type?: string }

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {settings.map((s) => (
        <div key={s.key}>
          {s.type === "toggle" ? (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {values[s.key] === "true" ? "Aktif — müşteriler kapıda ödeme seçebilir" : "Pasif — kapıda ödeme seçeneği gizli"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValues({ ...values, [s.key]: values[s.key] === "true" ? "false" : "true" })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  values[s.key] === "true" ? "bg-honey-dark" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    values[s.key] === "true" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
              <input
                value={values[s.key] ?? ""}
                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              />
            </>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} loading={saving}>Ayarları Kaydet</Button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Kaydedildi</span>}
      </div>
    </div>
  );
}
