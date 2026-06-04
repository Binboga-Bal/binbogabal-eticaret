"use client";

import { useState } from "react";
import { Save, Sparkles, Eye, BarChart2, Bot, Globe, Code, Settings } from "lucide-react";

const TABS = [
  { id: "basic", label: "Temel Meta", icon: <BarChart2 size={15} /> },
  { id: "og", label: "Open Graph", icon: <Globe size={15} /> },
  { id: "schema", label: "Yapısal Veri", icon: <Code size={15} /> },
  { id: "generative", label: "Generative SEO", icon: <Bot size={15} /> },
  { id: "advanced", label: "Gelişmiş", icon: <Settings size={15} /> },
];

interface Props {
  entityType: string;
  entityId: string;
  locale: string;
  initial: Record<string, unknown> | null;
  fallbackTitle?: string | null;
  fallbackDesc?: string | null;
}

export function SeoMetaEditor({ entityType, entityId, locale, initial, fallbackTitle, fallbackDesc }: Props) {
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<Record<string, unknown>>({
    title: initial?.title ?? fallbackTitle ?? "",
    description: initial?.description ?? fallbackDesc ?? "",
    keywords: initial?.keywords ?? [],
    canonicalUrl: initial?.canonicalUrl ?? "",
    noIndex: initial?.noIndex ?? false,
    noFollow: initial?.noFollow ?? false,
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
    ogImage: initial?.ogImage ?? "",
    ogType: initial?.ogType ?? "website",
    twitterCard: initial?.twitterCard ?? "summary_large_image",
    twitterTitle: initial?.twitterTitle ?? "",
    twitterDescription: initial?.twitterDescription ?? "",
    twitterImage: initial?.twitterImage ?? "",
    schemaMarkup: initial?.schemaMarkup ? JSON.stringify(initial.schemaMarkup, null, 2) : "",
    llmSummary: initial?.llmSummary ?? "",
    llmKeyFacts: initial?.llmKeyFacts ? JSON.stringify(initial.llmKeyFacts, null, 2) : "{}",
    llmQaPairs: initial?.llmQaPairs ? JSON.stringify(initial.llmQaPairs, null, 2) : "[]",
    seoScore: initial?.seoScore ?? null,
    llmScore: initial?.llmScore ?? null,
  });

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        keywords: typeof form.keywords === "string" ? (form.keywords as string).split(",").map((k) => k.trim()).filter(Boolean) : form.keywords,
        schemaMarkup: form.schemaMarkup ? JSON.parse(form.schemaMarkup as string) : null,
        llmKeyFacts: form.llmKeyFacts ? JSON.parse(form.llmKeyFacts as string) : null,
        llmQaPairs: form.llmQaPairs ? JSON.parse(form.llmQaPairs as string) : null,
      };
      const res = await fetch(`/api/admin/seo/meta/${entityType}/${entityId}/${locale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      const data = await res.json();
      set("seoScore", data.seoScore);
      set("llmScore", data.llmScore);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const generateAi = async (mode: "meta" | "llm" | "full") => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/seo/meta/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, locale, mode }),
      });
      if (!res.ok) throw new Error("AI hatası");
      const data = await res.json();
      if (mode === "meta" || mode === "full") {
        if (data.title) set("title", data.title);
        if (data.description) set("description", data.description);
        if (data.keywords?.length) set("keywords", data.keywords);
        if (data.seoScore) set("seoScore", data.seoScore);
      }
      if (mode === "llm" || mode === "full") {
        if (data.llmSummary) set("llmSummary", data.llmSummary);
        if (data.llmKeyFacts) set("llmKeyFacts", JSON.stringify(data.llmKeyFacts, null, 2));
        if (data.llmQaPairs) set("llmQaPairs", JSON.stringify(data.llmQaPairs, null, 2));
        if (data.llmScore) set("llmScore", data.llmScore);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const scoreColor = (score: unknown) => {
    const s = Number(score);
    if (!s) return "bg-gray-100 text-gray-500";
    if (s >= 71) return "bg-green-100 text-green-700";
    if (s >= 41) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const titleLen = String(form.title ?? "").length;
  const descLen = String(form.description ?? "").length;

  return (
    <div className="space-y-4">
      {/* Skor & Kaydet */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${scoreColor(form.seoScore)}`}>
            SEO: {String(form.seoScore ?? "-")}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${scoreColor(form.llmScore)}`}>
            LLM: {String(form.llmScore ?? "-")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              disabled={aiLoading}
              onClick={() => generateAi("full")}
              className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles size={13} /> {aiLoading ? "Üretiliyor..." : "AI Tam Optimize"}
            </button>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {activeTab === "basic" && (
            <>
              {/* SERP Önizleme */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Eye size={12} /> Google Önizleme</p>
                <p className="text-blue-700 text-sm font-medium truncate">{String(form.title ?? "") || "Başlık..."}</p>
                <p className="text-green-700 text-xs">{`${process.env.NEXT_PUBLIC_APP_URL ?? "https://..."} › ...`}</p>
                <p className="text-gray-600 text-xs line-clamp-2">{String(form.description ?? "") || "Açıklama..."}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 flex items-center justify-between mb-1">
                    Title <span className={`font-normal ${titleLen > 60 ? "text-red-500" : titleLen >= 30 ? "text-green-500" : "text-gray-400"}`}>{titleLen}/60</span>
                  </label>
                  <input value={String(form.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder={fallbackTitle ?? "SEO başlığı..."} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 flex items-center justify-between mb-1">
                    Description <span className={`font-normal ${descLen > 160 ? "text-red-500" : descLen >= 120 ? "text-green-500" : "text-gray-400"}`}>{descLen}/160</span>
                  </label>
                  <textarea value={String(form.description ?? "")} onChange={(e) => set("description", e.target.value)} placeholder={fallbackDesc ?? "Meta açıklama..."} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Keywords (virgülle ayır)</label>
                  <input
                    value={Array.isArray(form.keywords) ? (form.keywords as string[]).join(", ") : String(form.keywords ?? "")}
                    onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))}
                    placeholder="bal, doğal bal, kooperatif..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generateAi("meta")} disabled={aiLoading} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 disabled:opacity-50">
                    <Sparkles size={12} /> AI ile Meta Üret
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "og" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">OG Title</label>
                <input value={String(form.ogTitle ?? "")} onChange={(e) => set("ogTitle", e.target.value)} placeholder={String(form.title ?? "")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">OG Description</label>
                <textarea value={String(form.ogDescription ?? "")} onChange={(e) => set("ogDescription", e.target.value)} placeholder={String(form.description ?? "")} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">OG Image URL</label>
                <input value={String(form.ogImage ?? "")} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">OG Type</label>
                <select value={String(form.ogType ?? "website")} onChange={(e) => set("ogType", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">JSON-LD yapısal veri (Schema.org)</p>
              <textarea
                value={String(form.schemaMarkup ?? "")}
                onChange={(e) => set("schemaMarkup", e.target.value)}
                rows={15}
                placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Product"\n}'
                className="w-full font-mono text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
            </div>
          )}

          {activeTab === "generative" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">ChatGPT, Perplexity, Gemini ve Claude için optimize içerik</p>
                <button onClick={() => generateAi("llm")} disabled={aiLoading} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 disabled:opacity-50">
                  <Sparkles size={12} /> AI ile LLM Optimize Et
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                  LLM Özet <span className="font-normal text-gray-400">{String(form.llmSummary ?? "").split(/\s+/).filter(Boolean).length} kelime (min: 150)</span>
                </label>
                <textarea value={String(form.llmSummary ?? "")} onChange={(e) => set("llmSummary", e.target.value)} rows={6} placeholder="LLM'lerin anlayacağı net, olgusal özet..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Key Facts (JSON)</label>
                <textarea value={String(form.llmKeyFacts ?? "{}")} onChange={(e) => set("llmKeyFacts", e.target.value)} rows={5} className="w-full font-mono text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">SSS Çiftleri (JSON)</label>
                <textarea value={String(form.llmQaPairs ?? "[]")} onChange={(e) => set("llmQaPairs", e.target.value)} rows={8} className="w-full font-mono text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Canonical URL</label>
                <input value={String(form.canonicalUrl ?? "")} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={Boolean(form.noIndex)} onChange={(e) => set("noIndex", e.target.checked)} className="rounded" />
                  noIndex
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={Boolean(form.noFollow)} onChange={(e) => set("noFollow", e.target.checked)} className="rounded" />
                  noFollow
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
