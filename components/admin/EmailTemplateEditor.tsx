"use client";

import { useState } from "react";

interface TemplateContent {
  subject: string;
  title: string;
  body: string;
  buttonText?: string;
  note?: string;
}

interface Template {
  key: string;
  name: string;
  description: string;
  hasButton: boolean;
  hasNote: boolean;
  content: TemplateContent;
}

interface Props {
  initialTemplates: Template[];
}

export function EmailTemplateEditor({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<TemplateContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeTemplate = templates.find((t) => t.key === activeKey);

  function openEditor(template: Template) {
    setActiveKey(template.key);
    setEditing({ ...template.content });
    setMessage(null);
  }

  async function handleSave() {
    if (!activeKey || !editing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      setTemplates((prev) =>
        prev.map((t) => (t.key === activeKey ? { ...t, content: data.content } : t))
      );
      setMessage({ type: "success", text: "Şablon kaydedildi." });
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!activeKey) return;
    if (!confirm("Şablonu varsayılan değerlere sıfırlamak istediğinizden emin misiniz?")) return;
    setResetting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sıfırlama başarısız");
      setTemplates((prev) =>
        prev.map((t) => (t.key === activeKey ? { ...t, content: data.content } : t))
      );
      setEditing({ ...data.content });
      setMessage({ type: "success", text: "Şablon varsayılanlara sıfırlandı." });
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Template list ── */}
      <div className="lg:col-span-1 space-y-2">
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => openEditor(t)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
              activeKey === t.key
                ? "border-honey bg-honey/5"
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <p className="font-semibold text-sm text-gray-800">{t.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.description}</p>
          </button>
        ))}
      </div>

      {/* ── Editor ── */}
      <div className="lg:col-span-2">
        {!activeTemplate || !editing ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            Düzenlemek için soldan bir şablon seçin
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-gray-900 text-base">{activeTemplate.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{activeTemplate.description}</p>
              </div>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-gray-100 hover:border-red-200"
              >
                {resetting ? "Sıfırlanıyor…" : "Varsayılana Sıfırla"}
              </button>
            </div>

            {message && (
              <div
                className={`text-sm px-4 py-2.5 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Konu (Subject)
              </label>
              <input
                type="text"
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Başlık (Title)
              </label>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                İçerik{" "}
                <span className="text-gray-400 font-normal">(her satır yeni paragraf)</span>
              </label>
              <textarea
                rows={5}
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey resize-y"
              />
            </div>

            {activeTemplate.hasButton && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Buton Metni
                </label>
                <input
                  type="text"
                  value={editing.buttonText ?? ""}
                  onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
                />
              </div>
            )}

            {activeTemplate.hasNote && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Alt Not{" "}
                  <span className="text-gray-400 font-normal">
                    (saat sınırı, güvenlik notu vb.)
                  </span>
                </label>
                <input
                  type="text"
                  value={editing.note ?? ""}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
                />
              </div>
            )}

            {/* Preview box */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Önizleme</p>
              <div className="bg-[#F9B10B] rounded-t-lg px-4 py-3 text-center">
                <span className="text-white font-black text-sm uppercase tracking-wide">
                  KOOPERATİF BALI
                </span>
              </div>
              <div className="bg-white px-4 py-4 rounded-b-lg border border-t-0 border-gray-100 space-y-2">
                <p className="font-bold text-gray-900 text-sm text-center">{editing.title || "—"}</p>
                <p className="text-xs text-gray-500 text-center whitespace-pre-line leading-relaxed">
                  {editing.body || "—"}
                </p>
                {activeTemplate.hasButton && editing.buttonText && (
                  <div className="text-center pt-1">
                    <span className="inline-block bg-[#F9B10B] text-white text-xs font-bold px-5 py-2 rounded-full">
                      {editing.buttonText}
                    </span>
                  </div>
                )}
                {activeTemplate.hasNote && editing.note && (
                  <p className="text-[11px] text-gray-400 text-center">{editing.note}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-honey text-white font-bold py-3 rounded-xl hover:bg-honey-dark transition-colors disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
