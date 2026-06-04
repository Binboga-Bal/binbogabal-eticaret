"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const LEVELS = [
  { value: "CRITICAL", label: "Kritik", cls: "border-red-300 text-red-700 bg-red-50" },
  { value: "ERROR",    label: "Hata",   cls: "border-orange-300 text-orange-700 bg-orange-50" },
  { value: "WARNING",  label: "Uyarı",  cls: "border-yellow-300 text-yellow-700 bg-yellow-50" },
  { value: "INFO",     label: "Bilgi",  cls: "border-blue-300 text-blue-700 bg-blue-50" },
  { value: "DEBUG",    label: "Debug",  cls: "border-gray-300 text-gray-700 bg-gray-50" },
];

const QUICK_RANGES = [
  { label: "Son 1s", hours: 1 },
  { label: "Son 24s", hours: 24 },
  { label: "Son 7g", hours: 24 * 7 },
  { label: "Son 30g", hours: 24 * 30 },
];

export function LogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      if (value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const activelevels = searchParams.getAll("level");

  function toggleLevel(level: string) {
    const next = activelevels.includes(level)
      ? activelevels.filter((l) => l !== level)
      : [...activelevels, level];
    update("level", next.length > 0 ? next : null);
  }

  function setQuickRange(hours: number) {
    const from = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateFrom", from);
    params.delete("dateTo");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleReset() {
    router.push(pathname);
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      {/* Level toggles */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Seviye</label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(({ value, label, cls }) => (
            <button
              key={value}
              onClick={() => toggleLevel(value)}
              className={`rounded border px-3 py-1 text-xs font-semibold transition-opacity ${cls} ${
                activelevels.includes(value) ? "opacity-100 ring-2 ring-offset-1 ring-current" : "opacity-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick date range */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Hızlı Tarih</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_RANGES.map(({ label, hours }) => (
            <Button key={label} variant="outline" size="sm" onClick={() => setQuickRange(hours)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Text filters */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className="text-xs text-slate-600">Aktör E-posta</label>
          <Input
            placeholder="user@..."
            defaultValue={searchParams.get("actorEmail") ?? ""}
            onBlur={(e) => update("actorEmail", e.target.value || null)}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">IP Adresi</label>
          <Input
            placeholder="123.45."
            defaultValue={searchParams.get("actorIp") ?? ""}
            onBlur={(e) => update("actorIp", e.target.value || null)}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Aksiyon</label>
          <Input
            placeholder="ORDER_CREATED"
            defaultValue={searchParams.get("action") ?? ""}
            onBlur={(e) => update("action", e.target.value || null)}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Arama</label>
          <Input
            placeholder="Mesaj ara..."
            defaultValue={searchParams.get("search") ?? ""}
            onBlur={(e) => update("search", e.target.value || null)}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Filtreleri Sıfırla
        </Button>
      </div>
    </div>
  );
}
