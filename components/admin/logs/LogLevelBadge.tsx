"use client";

import { type LogLevel } from "@prisma/client";

const CONFIG: Record<LogLevel, { label: string; className: string }> = {
  CRITICAL: { label: "KRİTİK", className: "bg-red-100 text-red-800 border border-red-300" },
  ERROR:    { label: "HATA",   className: "bg-orange-100 text-orange-800 border border-orange-300" },
  WARNING:  { label: "UYARI",  className: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  INFO:     { label: "BİLGİ",  className: "bg-blue-100 text-blue-800 border border-blue-300" },
  DEBUG:    { label: "DEBUG",  className: "bg-gray-100 text-gray-700 border border-gray-300" },
};

export function LogLevelBadge({ level }: { level: LogLevel }) {
  const { label, className } = CONFIG[level] ?? CONFIG.DEBUG;
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
