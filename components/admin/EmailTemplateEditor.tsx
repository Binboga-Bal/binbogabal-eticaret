"use client";

import { useState } from "react";
import type {
  EmailInfographic,
  InfographicIconKey,
} from "@/lib/mail/infographic-types";
import { INFOGRAPHIC_ICON_OPTIONS } from "@/lib/mail/infographic-types";

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
  initialInfographic: EmailInfographic;
}

const HONEY = "#F9B10B";
const HONEY_DARK = "#C57930";

/* ── Mini SVG icon renderer (preview only) ── */
function MiniIcon({ icon }: { icon: InfographicIconKey }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24" as string,
    fill: "none",
    stroke: HONEY_DARK,
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "honey":    return <svg {...p}><path d="M8 3h8l1 3H7z"/><rect x="6" y="6" width="12" height="14" rx="3"/><path d="M12 10v4M10 12h4"/></svg>;
    case "leaf":     return <svg {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
    case "shield":   return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
    case "truck":    return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case "star":     return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "heart":    return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "check":    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
    case "gift":     return <svg {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
    default:         return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

type Tab = "templates" | "infographic";

export function EmailTemplateEditor({ initialTemplates, initialInfographic }: Props) {
  const [tab, setTab] = useState<Tab>("templates");

  /* ── Template state ── */
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<TemplateContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tplMsg, setTplMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ── Infographic state ── */
  const [infog, setInfog] = useState<EmailInfographic>(initialInfographic);
  const [infogSaving, setInfogSaving] = useState(false);
  const [infogMsg, setInfogMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeTemplate = templates.find((t) => t.key === activeKey);

  /* ── Template handlers ── */
  function openEditor(template: Template) {
    setActiveKey(template.key);
    setEditing({ ...template.content });
    setTplMsg(null);
  }

  async function handleSave() {
    if (!activeKey || !editing) return;
    setSaving(true);
    setTplMsg(null);
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
      setTplMsg({ type: "success", text: "Şablon kaydedildi." });
    } catch (e) {
      setTplMsg({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!activeKey) return;
    if (!confirm("Şablonu varsayılan değerlere sıfırlamak istediğinizden emin misiniz?")) return;
    setResetting(true);
    setTplMsg(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sıfırlama başarısız");
      setTemplates((prev) =>
        prev.map((t) => (t.key === activeKey ? { ...t, content: data.content } : t))
      );
      setEditing({ ...data.content });
      setTplMsg({ type: "success", text: "Şablon varsayılanlara sıfırlandı." });
    } catch (e) {
      setTplMsg({ type: "error", text: (e as Error).message });
    } finally {
      setResetting(false);
    }
  }

  /* ── Infographic handlers ── */
  async function handleInfogSave() {
    setInfogSaving(true);
    setInfogMsg(null);
    try {
      const res = await fetch("/api/admin/email-templates/infographic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infog),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      setInfog(data.infographic);
      setInfogMsg({ type: "success", text: "İnfografik kaydedildi." });
    } catch (e) {
      setInfogMsg({ type: "error", text: (e as Error).message });
    } finally {
      setInfogSaving(false);
    }
  }

  function updateItem(i: number, patch: Partial<EmailInfographic["items"][number]>) {
    setInfog((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    if (infog.items.length >= 4) return;
    setInfog((prev) => ({
      ...prev,
      items: [...prev.items, { icon: "star", text: "Yeni Özellik" }],
    }));
  }

  function removeItem(i: number) {
    setInfog((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
  }

  /* ── Render ── */
  return (
    <div>
      {/* ── Sekme başlıkları ── */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {(["templates", "infographic"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              tab === t
                ? "bg-white border border-b-white border-gray-100 text-gray-900 -mb-px"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {t === "templates" ? "Şablon Metinleri" : "İnfografik Bölüm"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════ TEMPLATES TAB ═══════════════════════════════ */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste */}
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

          {/* Editör */}
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

                {tplMsg && (
                  <div
                    className={`text-sm px-4 py-2.5 rounded-lg ${
                      tplMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {tplMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Konu (Subject)</label>
                  <input
                    type="text"
                    value={editing.subject}
                    onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Başlık (Title)</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    İçerik <span className="text-gray-400 font-normal">(her satır yeni paragraf)</span>
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
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Buton Metni</label>
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
                      Alt Not <span className="text-gray-400 font-normal">(saat sınırı, güvenlik notu vb.)</span>
                    </label>
                    <input
                      type="text"
                      value={editing.note ?? ""}
                      onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey/30 focus:border-honey"
                    />
                  </div>
                )}

                {/* Önizleme */}
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
      )}

      {/* ═══════════════════════════════ INFOGRAPHIC TAB ═══════════════════════════════ */}
      {tab === "infographic" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div>
              <h2 className="font-bold text-gray-900">İnfografik Bölüm</h2>
              <p className="text-sm text-gray-500 mt-1">
                Tüm e-postalarda footer'ın üstünde görünür. Maksimum 4 öğe ekleyebilirsiniz.
              </p>
            </div>

            {infogMsg && (
              <div
                className={`text-sm px-4 py-2.5 rounded-lg ${
                  infogMsg.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {infogMsg.text}
              </div>
            )}

            {/* Göster/Gizle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setInfog((p) => ({ ...p, show: !p.show }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  infog.show ? "bg-honey" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    infog.show ? "left-5" : "left-1"
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {infog.show ? "İnfografik görünür" : "İnfografik gizli"}
              </span>
            </label>

            {/* Öğe listesi */}
            <div className="space-y-3">
              {infog.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  {/* İkon seçici */}
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(i, { icon: e.target.value as InfographicIconKey })}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-honey/30 shrink-0"
                  >
                    {INFOGRAPHIC_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Önizleme ikonu */}
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-100">
                    <MiniIcon icon={item.icon} />
                  </div>

                  {/* Metin */}
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItem(i, { text: e.target.value })}
                    placeholder="Öğe metni"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-honey/30"
                  />

                  {/* Sil */}
                  <button
                    onClick={() => removeItem(i)}
                    className="shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1"
                    title="Öğeyi sil"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Öğe ekle */}
            {infog.items.length < 4 && (
              <button
                onClick={addItem}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-honey hover:text-honey transition-colors"
              >
                + Öğe Ekle
              </button>
            )}

            {/* Önizleme */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-3">Önizleme</p>
              {infog.show && infog.items.length > 0 ? (
                <div className="flex justify-around gap-2">
                  {infog.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center flex-1"
                      style={{ background: "#fffbf0", borderColor: "#F9B10B33" }}
                    >
                      <MiniIcon icon={item.icon} />
                      <span className="text-[11px] font-bold text-gray-600 leading-tight">{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center">İnfografik gizli veya öğe yok</p>
              )}
            </div>

            <button
              onClick={handleInfogSave}
              disabled={infogSaving}
              className="w-full bg-honey text-white font-bold py-3 rounded-xl hover:bg-honey-dark transition-colors disabled:opacity-50"
            >
              {infogSaving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
