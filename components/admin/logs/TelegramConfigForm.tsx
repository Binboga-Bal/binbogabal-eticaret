"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type TelegramAlertConfig } from "@prisma/client";

interface Props {
  configs: TelegramAlertConfig[];
  onRefresh: () => void;
}

const ALL_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] as const;

const AUDIT_MODULES = [
  { value: "auth", label: "Auth (giriş/çıkış/2FA)" },
  { value: "admin_users", label: "Admin Kullanıcılar" },
  { value: "roles", label: "Roller & Yetkiler" },
  { value: "security", label: "Güvenlik" },
  { value: "campaigns", label: "Kampanyalar" },
  { value: "settings", label: "Ayarlar" },
];

const SOURCE_LABELS: Record<string, string> = {
  ALL: "Tümü (Activity + Audit)",
  ACTIVITY: "Sadece Activity Loglar",
  AUDIT: "Sadece Audit Loglar",
};

export function TelegramConfigForm({ configs, onRefresh }: Props) {
  const [chatId, setChatId] = useState("");
  const [label, setLabel] = useState("");
  const [logSource, setLogSource] = useState<"ALL" | "ACTIVITY" | "AUDIT">("ALL");
  const [levels, setLevels] = useState<string[]>(["ERROR", "CRITICAL"]);
  const [auditModules, setAuditModules] = useState<string[]>([]);
  const [minRiskScore, setMinRiskScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<string | null>(null);

  function toggleLevel(level: string) {
    setLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
  }

  function toggleAuditModule(mod: string) {
    setAuditModules((prev) => prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, label, logSource, levels, auditModules, minRiskScore }),
      });
      if (res.ok) {
        setChatId("");
        setLabel("");
        setLogSource("ALL");
        setLevels(["ERROR", "CRITICAL"]);
        setAuditModules([]);
        setMinRiskScore(0);
        onRefresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch(`/api/admin/logs/telegram/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kanalı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/logs/telegram/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleTest(id: string, cid: string) {
    setTestLoading(id);
    try {
      const res = await fetch("/api/admin/logs/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: cid }),
      });
      if (res.ok) {
        alert("Test mesajı gönderildi!");
      } else {
        const d = await res.json();
        alert(d.error ?? "Hata oluştu");
      }
    } finally {
      setTestLoading(null);
    }
  }

  const showActivityFilters = logSource === "ACTIVITY" || logSource === "ALL";
  const showAuditFilters = logSource === "AUDIT" || logSource === "ALL";

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-lg border p-4 space-y-4 bg-white">
        <h3 className="font-semibold text-sm">Yeni Kanal Ekle</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Chat ID</label>
            <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-100123456789" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Etiket</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Güvenlik Kanalı" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Log Kaynağı</label>
          <div className="flex gap-4">
            {(["ALL", "ACTIVITY", "AUDIT"] as const).map((src) => (
              <label key={src} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="logSource"
                  value={src}
                  checked={logSource === src}
                  onChange={() => setLogSource(src)}
                />
                {SOURCE_LABELS[src]}
              </label>
            ))}
          </div>
        </div>

        {showActivityFilters && (
          <div className="space-y-3 rounded border p-3 bg-slate-50">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Activity Log Filtreleri</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Alert Seviyeleri</label>
              <div className="flex gap-2 flex-wrap">
                {ALL_LEVELS.map((l) => (
                  <label key={l} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={levels.includes(l)}
                      onChange={() => toggleLevel(l)}
                      className="rounded"
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {showAuditFilters && (
          <div className="space-y-3 rounded border p-3 bg-slate-50">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Audit Log Filtreleri</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Modüller <span className="text-slate-400 font-normal">(boş = tümü)</span></label>
              <div className="flex gap-2 flex-wrap">
                {AUDIT_MODULES.map((m) => (
                  <label key={m.value} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditModules.includes(m.value)}
                      onChange={() => toggleAuditModule(m.value)}
                      className="rounded"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Minimum Risk Skoru: <span className="font-bold">{minRiskScore}</span>
                <span className="text-slate-400 font-normal"> (0 = tümü gönder)</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minRiskScore}
                onChange={(e) => setMinRiskScore(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0 — hepsi</span>
                <span>30 — orta risk</span>
                <span>60 — yüksek risk</span>
                <span>100</span>
              </div>
            </div>
          </div>
        )}

        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Ekleniyor..." : "Kanal Ekle"}
        </Button>
      </form>

      <div className="space-y-3">
        {configs.length === 0 && (
          <p className="text-sm text-slate-500">Henüz Telegram kanalı tanımlanmamış.</p>
        )}
        {configs.map((config) => (
          <div key={config.id} className="rounded-lg border p-3 bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-slate-500">Chat ID: {config.chatId}</p>
                <p className="text-xs text-slate-500">
                  Kaynak: <span className="font-medium">{SOURCE_LABELS[config.logSource] ?? config.logSource}</span>
                </p>
                {(config.logSource === "ACTIVITY" || config.logSource === "ALL") && (
                  <p className="text-xs text-slate-500">Seviyeler: {config.levels.join(", ")}</p>
                )}
                {(config.logSource === "AUDIT" || config.logSource === "ALL") && (
                  <>
                    <p className="text-xs text-slate-500">
                      Modüller: {config.auditModules.length > 0 ? config.auditModules.join(", ") : "tümü"}
                    </p>
                    <p className="text-xs text-slate-500">Min. Risk: {config.minRiskScore}</p>
                  </>
                )}
                {!config.isActive && (
                  <span className="inline-block text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">Devre dışı</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(config.id, config.chatId)}
                  disabled={testLoading === config.id}
                >
                  {testLoading === config.id ? "..." : "Test"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(config.id, config.isActive)}
                >
                  {config.isActive ? "Devre Dışı" : "Aktifleştir"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(config.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
