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

export function TelegramConfigForm({ configs, onRefresh }: Props) {
  const [chatId, setChatId] = useState("");
  const [label, setLabel] = useState("");
  const [levels, setLevels] = useState<string[]>(["ERROR", "CRITICAL"]);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<string | null>(null);

  function toggleLevel(level: string) {
    setLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, label, levels }),
      });
      if (res.ok) {
        setChatId("");
        setLabel("");
        setLevels(["ERROR", "CRITICAL"]);
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
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Ekleniyor..." : "Kanal Ekle"}
        </Button>
      </form>

      <div className="space-y-3">
        {configs.length === 0 && (
          <p className="text-sm text-slate-500">Henüz Telegram kanalı tanımlanmamış.</p>
        )}
        {configs.map((config) => (
          <div key={config.id} className="flex items-center justify-between rounded-lg border p-3 bg-white">
            <div>
              <p className="font-medium text-sm">{config.label}</p>
              <p className="text-xs text-slate-500">Chat ID: {config.chatId}</p>
              <p className="text-xs text-slate-500">Seviyeler: {config.levels.join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
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
        ))}
      </div>
    </div>
  );
}
