"use client";

import { useState } from "react";
import { type ActivityLog } from "@prisma/client";
import { LogLevelBadge } from "./LogLevelBadge";
import { LogCategoryBadge } from "./LogCategoryBadge";
import { LogDetailDrawer } from "./LogDetailDrawer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  logs: ActivityLog[];
}

export function LogTable({ logs }: Props) {
  const [selected, setSelected] = useState<ActivityLog | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function filterBy(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
              <th className="px-3 py-2 text-left">Zaman</th>
              <th className="px-3 py-2 text-left">Seviye</th>
              <th className="px-3 py-2 text-left">Kategori</th>
              <th className="px-3 py-2 text-left">Aksiyon</th>
              <th className="px-3 py-2 text-left">Aktör</th>
              <th className="px-3 py-2 text-left">Hedef</th>
              <th className="px-3 py-2 text-left">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  Log kaydı bulunamadı
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const date = new Date(log.createdAt).toLocaleString("tr-TR", {
                timeZone: "Europe/Istanbul",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                day: "2-digit",
                month: "2-digit",
              });
              return (
                <tr
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="border-b last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{date}</td>
                  <td className="px-3 py-2"><LogLevelBadge level={log.level} /></td>
                  <td className="px-3 py-2"><LogCategoryBadge category={log.category} /></td>
                  <td className="px-3 py-2 max-w-[220px]">
                    <span className="font-mono text-xs text-slate-700 block truncate">{log.action}</span>
                    {log.message && (
                      <span className="text-xs text-slate-400 block truncate mt-0.5">{log.message}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {log.actorEmail ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); filterBy("actorEmail", log.actorEmail!); }}
                        className="text-xs text-blue-600 hover:underline truncate max-w-[140px] block"
                      >
                        {log.actorEmail}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">sistem</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {log.targetLabel ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (log.targetType && log.targetId) filterBy("targetId", log.targetId); }}
                        className="text-xs text-slate-700 hover:underline truncate max-w-[120px] block"
                      >
                        {log.targetLabel}
                      </button>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {log.actorIp ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); filterBy("actorIp", log.actorIp!); }}
                        className="text-xs font-mono text-slate-600 hover:underline"
                      >
                        {log.actorIp}
                      </button>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LogDetailDrawer log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
