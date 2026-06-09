"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface LegalDoc {
  key: string;
  label: string;
  value: string;
}

export function LegalDocEditor({ docs }: { docs: LegalDoc[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(docs.map((d) => [d.key, d.value]))
  );
  const [activeKey, setActiveKey] = useState(docs[0]?.key ?? "");
  const [preview, setPreview] = useState(false);
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

  const activeDoc = docs.find((d) => d.key === activeKey);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
        {docs.map((doc) => (
          <button
            key={doc.key}
            type="button"
            onClick={() => { setActiveKey(doc.key); setPreview(false); }}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors -mb-px ${
              activeKey === doc.key
                ? "bg-white border-gray-200 text-gray-900"
                : "bg-gray-50 border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={{ minHeight: "unset", minWidth: "unset", display: "inline-flex" }}
          >
            {doc.label}
          </button>
        ))}
      </div>

      {/* Editor / Preview */}
      {activeDoc && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Ham HTML — başlık için <code className="bg-gray-100 px-1 rounded">&lt;h2&gt;</code>, paragraf için <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code>, liste için <code className="bg-gray-100 px-1 rounded">&lt;ul&gt;&lt;li&gt;</code> kullanın. Tarih satırına <code className="bg-gray-100 px-1 rounded">class="date"</code> ekleyin.
            </p>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="text-xs text-honey-dark hover:underline flex-shrink-0"
              style={{ minHeight: "unset", minWidth: "unset", display: "inline-flex" }}
            >
              {preview ? "Düzenle" : "Önizle"}
            </button>
          </div>

          {preview ? (
            <div
              className="legal-content min-h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-auto"
              dangerouslySetInnerHTML={{ __html: values[activeKey] ?? "" }}
            />
          ) : (
            <textarea
              value={values[activeKey] ?? ""}
              onChange={(e) => setValues({ ...values, [activeKey]: e.target.value })}
              rows={24}
              spellCheck={false}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-honey resize-y"
              placeholder="HTML içerik buraya..."
              style={{ fontSize: "13px" }}
            />
          )}
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} loading={saving}>Kaydet</Button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Kaydedildi</span>}
      </div>
    </div>
  );
}
