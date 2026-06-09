"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";

interface Setting { key: string; label: string; value: string; type?: string; description?: string; options?: { label: string; value: string }[] }

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
                  {s.description ?? (values[s.key] === "true" ? "Aktif" : "Pasif")}
                </p>
              </div>
              <Toggle
                checked={values[s.key] === "true"}
                onChange={(v) => setValues({ ...values, [s.key]: v ? "true" : "false" })}
                label={s.label}
              />
            </div>
          ) : s.type === "select" && s.options ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
              <select
                value={values[s.key] ?? ""}
                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey bg-white"
              >
                {s.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </>
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
