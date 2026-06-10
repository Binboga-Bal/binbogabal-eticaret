"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PRESETS = [
  { label: "Bugün", value: "today" },
  { label: "Son 7 Gün", value: "7d" },
  { label: "Son 30 Gün", value: "30d" },
  { label: "Bu Ay", value: "month" },
  { label: "Tüm Zamanlar", value: "all" },
] as const;

export function OrderDateFilter({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(preset: string) {
    const qs = new URLSearchParams();
    const durum = searchParams.get("durum");
    if (durum) qs.set("durum", durum);
    if (preset !== "all") qs.set("preset", preset);
    router.push(`${pathname}${qs.size > 0 ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => select(p.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === p.value
              ? "bg-honey text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
