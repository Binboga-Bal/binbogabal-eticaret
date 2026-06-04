import { getAdminSession } from "@/lib/admin-auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

interface StatsData {
  totalLogs: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
  topIps: Array<{ ip: string; count: number }>;
  errorRate: number;
  timeline: Array<{ date: string; total: number; errors: number }>;
  recentCritical: Array<{ id: string; message: string; action: string; createdAt: string }>;
}

async function fetchStats(period: string): Promise<StatsData> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/logs/stats?period=${period}`,
    { headers: { Cookie: "" }, cache: "no-store" },
  ).catch(() => null);
  if (!res?.ok) return {
    totalLogs: 0, byLevel: {}, byCategory: {}, topActions: [], topIps: [],
    errorRate: 0, timeline: [], recentCritical: [],
  };
  return res.json();
}

export default async function LogStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getAdminSession();
  if (!session?.isSuperAdmin) redirect("/admin");

  const sp = await searchParams;
  const period = sp.period ?? "7d";

  // Stats are fetched client-side via the API to avoid cookie forwarding issues
  // This page provides the shell; data loads via the stats API route with admin session cookie
  const LEVEL_COLORS: Record<string, string> = {
    CRITICAL: "bg-red-500",
    ERROR: "bg-orange-500",
    WARNING: "bg-yellow-400",
    INFO: "bg-blue-400",
    DEBUG: "bg-gray-300",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Log İstatistikleri</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/logs" className="text-sm text-blue-600 hover:underline">
            ← Loglara Dön
          </Link>
          <div className="flex gap-1">
            {["7d", "30d", "90d"].map((p) => (
              <Link
                key={p}
                href={`?period=${p}`}
                className={`rounded border px-3 py-1 text-sm ${period === p ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-50"}`}
              >
                {p === "7d" ? "7 Gün" : p === "30d" ? "30 Gün" : "90 Gün"}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <LogStatsContent period={period} LEVEL_COLORS={LEVEL_COLORS} />
    </div>
  );
}

async function LogStatsContent({ period, LEVEL_COLORS }: { period: string; LEVEL_COLORS: Record<string, string> }) {
  const session = await getAdminSession();
  if (!session) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/admin/logs/stats?period=${period}`, {
    cache: "no-store",
    headers: {
      // Server-side fetch — cookie forwarding not available; relying on direct DB access below
    },
  }).catch(() => null);

  // Direct DB fallback for server components
  const { prisma } = await import("@/lib/prisma");
  const days = period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [byLevel, byCategory, topActions, topIps, recentCritical] = await Promise.all([
    prisma.activityLog.groupBy({ by: ["level"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
    prisma.activityLog.groupBy({ by: ["category"], _count: { _all: true }, where: { createdAt: { gte: since } }, orderBy: { _count: { category: "desc" } }, take: 10 }),
    prisma.activityLog.groupBy({ by: ["action"], _count: { _all: true }, where: { createdAt: { gte: since } }, orderBy: { _count: { action: "desc" } }, take: 10 }),
    prisma.activityLog.groupBy({ by: ["actorIp"], _count: { _all: true }, where: { createdAt: { gte: since }, actorIp: { not: null } }, orderBy: { _count: { actorIp: "desc" } }, take: 10 }),
    prisma.activityLog.findMany({ where: { level: "CRITICAL", createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalLogs = byLevel.reduce((s, b) => s + b._count._all, 0);
  const errorCount = byLevel.filter((b) => b.level === "ERROR" || b.level === "CRITICAL").reduce((s, b) => s + b._count._all, 0);
  const errorRate = totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label="Toplam Log" value={totalLogs.toLocaleString("tr-TR")} />
        <Card label="Hata Oranı" value={`%${errorRate}`} colorClass="text-red-700" />
        <Card label="Kritik" value={(byLevel.find((b) => b.level === "CRITICAL")?._count._all ?? 0).toLocaleString("tr-TR")} colorClass="text-red-700" />
        <Card label="Hata" value={(byLevel.find((b) => b.level === "ERROR")?._count._all ?? 0).toLocaleString("tr-TR")} colorClass="text-orange-700" />
      </div>

      {/* Level distribution */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-3">Seviye Dağılımı</h2>
        <div className="space-y-2">
          {byLevel.map((b) => {
            const pct = totalLogs > 0 ? (b._count._all / totalLogs) * 100 : 0;
            return (
              <div key={b.level} className="flex items-center gap-3">
                <span className="w-20 text-sm font-medium">{b.level}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${LEVEL_COLORS[b.level] ?? "bg-gray-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-16 text-right">{b._count._all.toLocaleString("tr-TR")}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top actions */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">En Sık Aksiyonlar</h2>
          <div className="space-y-1">
            {topActions.map((a) => (
              <div key={a.action} className="flex justify-between text-sm">
                <span className="font-mono text-xs text-slate-700 truncate">{a.action}</span>
                <span className="font-semibold">{a._count._all.toLocaleString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top IPs */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">En Aktif IP&apos;ler</h2>
          <div className="space-y-1">
            {topIps.map((ip) => (
              <div key={ip.actorIp} className="flex justify-between text-sm">
                <Link href={`/admin/logs?actorIp=${ip.actorIp}`} className="font-mono text-xs text-blue-600 hover:underline">
                  {ip.actorIp}
                </Link>
                <span className="font-semibold">{ip._count._all.toLocaleString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-3">Kategori Dağılımı</h2>
        <div className="flex flex-wrap gap-3">
          {byCategory.map((b) => (
            <Link
              key={b.category}
              href={`/admin/logs?category=${b.category}`}
              className="rounded-lg border px-3 py-2 text-center hover:bg-slate-50"
            >
              <div className="text-lg font-bold">{b._count._all}</div>
              <div className="text-xs text-slate-500">{b.category}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent critical */}
      {recentCritical.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-800 mb-3">Son Kritik Loglar</h2>
          <div className="space-y-2">
            {recentCritical.map((log) => (
              <div key={log.id} className="flex items-start justify-between text-sm">
                <div>
                  <span className="font-mono text-xs text-red-700">{log.action}</span>
                  <p className="text-slate-700">{log.message}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, colorClass = "text-slate-900" }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
    </div>
  );
}
