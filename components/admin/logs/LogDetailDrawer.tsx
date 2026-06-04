"use client";

import { type ActivityLog } from "@prisma/client";
import { LogLevelBadge } from "./LogLevelBadge";
import { LogCategoryBadge } from "./LogCategoryBadge";
import { JsonViewer } from "./JsonViewer";

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-slate-500">{label}</span>
      <span className="text-slate-900 break-all">{value}</span>
    </div>
  );
}

export function LogDetailDrawer({ log, onClose }: Props) {
  if (!log) return null;

  const date = new Date(log.createdAt).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <LogLevelBadge level={log.level} />
            <LogCategoryBadge category={log.category} />
            <span className="text-sm font-mono text-slate-600">{log.action}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100 text-slate-500 text-xl leading-none"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Row label="Mesaj" value={log.message} />
          <Row label="Zaman" value={date} />
          <Row label="Aktör ID" value={log.actorId} />
          <Row label="E-posta" value={log.actorEmail} />
          <Row label="Rol" value={log.actorRole} />
          <Row label="IP" value={log.actorIp} />
          <Row label="User Agent" value={log.userAgent} />
          <Row label="Hedef Tipi" value={log.targetType} />
          <Row label="Hedef ID" value={log.targetId} />
          <Row label="Hedef" value={log.targetLabel} />
          <Row label="Metod" value={log.method} />
          <Row label="Path" value={log.path} />
          <Row
            label="Durum Kodu"
            value={log.statusCode ? (
              <span className={log.statusCode >= 500 ? "text-red-600" : log.statusCode >= 400 ? "text-orange-600" : "text-green-700"}>
                {log.statusCode}
              </span>
            ) : null}
          />
          <Row label="Süre" value={log.duration ? `${log.duration} ms` : null} />
          <Row
            label="Telegram"
            value={log.telegramSent ? (
              <span className="text-green-700">Gönderildi {log.telegramMsgId ? `(#${log.telegramMsgId})` : ""}</span>
            ) : (
              <span className="text-slate-400">Gönderilmedi</span>
            )}
          />

          {log.detail !== null && log.detail !== undefined && (
            <div>
              <p className="text-sm text-slate-500 mb-1">Detay</p>
              <JsonViewer data={log.detail} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
