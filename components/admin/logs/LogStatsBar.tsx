"use client";

interface Props {
  critical: number;
  error: number;
  warning: number;
  info: number;
  total: number;
}

export function LogStatsBar({ critical, error, warning, info, total }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <StatCard label="Kritik" count={critical} colorClass="text-red-700 bg-red-50 border-red-200" />
      <StatCard label="Hata" count={error} colorClass="text-orange-700 bg-orange-50 border-orange-200" />
      <StatCard label="Uyarı" count={warning} colorClass="text-yellow-700 bg-yellow-50 border-yellow-200" />
      <StatCard label="Bilgi" count={info} colorClass="text-blue-700 bg-blue-50 border-blue-200" />
      <StatCard label="Toplam" count={total} colorClass="text-slate-700 bg-slate-50 border-slate-200" />
    </div>
  );
}

function StatCard({ label, count, colorClass }: { label: string; count: number; colorClass: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${colorClass}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count.toLocaleString("tr-TR")}</span>
    </div>
  );
}
