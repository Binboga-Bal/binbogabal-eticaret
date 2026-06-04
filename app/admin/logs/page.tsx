import { Suspense } from "react";
import { getAdminSession } from "@/lib/admin-auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type LogLevel, type LogCategory, type Prisma } from "@prisma/client";
import { LogTable } from "@/components/admin/logs/LogTable";
import { LogFilters } from "@/components/admin/logs/LogFilters";
import { LogStatsBar } from "@/components/admin/logs/LogStatsBar";
import { LogExportButton } from "@/components/admin/logs/LogExportButton";
import Link from "next/link";

interface SearchParams {
  page?: string;
  limit?: string;
  level?: string | string[];
  category?: string | string[];
  action?: string;
  actorEmail?: string;
  actorIp?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getAdminSession();
  if (!session?.isSuperAdmin) redirect("/admin");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const limit = Math.min(200, Math.max(1, parseInt(sp.limit ?? "50")));
  const skip = (page - 1) * limit;

  const levelParam = toArray(sp.level) as LogLevel[];
  const categoryParam = toArray(sp.category) as LogCategory[];
  const sortBy = (sp.sortBy ?? "createdAt") as "createdAt" | "level";
  const sortOrder = (sp.sortOrder ?? "desc") as "asc" | "desc";

  const where: Prisma.ActivityLogWhereInput = {
    ...(levelParam.length > 0 && { level: { in: levelParam } }),
    ...(categoryParam.length > 0 && { category: { in: categoryParam } }),
    ...(sp.action && { action: { contains: sp.action, mode: "insensitive" } }),
    ...(sp.actorEmail && { actorEmail: { contains: sp.actorEmail, mode: "insensitive" } }),
    ...(sp.actorIp && { actorIp: { startsWith: sp.actorIp } }),
    ...(sp.targetId && { targetId: sp.targetId }),
    ...((sp.dateFrom || sp.dateTo) && {
      createdAt: {
        ...(sp.dateFrom && { gte: new Date(sp.dateFrom) }),
        ...(sp.dateTo && { lte: new Date(sp.dateTo) }),
      },
    }),
    ...(sp.search && {
      OR: [
        { message: { contains: sp.search, mode: "insensitive" } },
        { action: { contains: sp.search, mode: "insensitive" } },
        { actorEmail: { contains: sp.search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.ActivityLogOrderByWithRelationInput =
    sortBy === "level" ? { level: sortOrder } : { createdAt: sortOrder };

  const [logs, total, byLevel] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy, skip, take: limit }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({
      by: ["level"],
      _count: { _all: true },
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const levelMap = Object.fromEntries(byLevel.map((b) => [b.level, b._count._all]));
  const totalPages = Math.ceil(total / limit);

  // Build query string for export (without pagination)
  const exportParams = new URLSearchParams();
  if (levelParam.length) levelParam.forEach((l) => exportParams.append("level", l));
  if (categoryParam.length) categoryParam.forEach((c) => exportParams.append("category", c));
  if (sp.dateFrom) exportParams.set("dateFrom", sp.dateFrom);
  if (sp.dateTo) exportParams.set("dateTo", sp.dateTo);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Aktivite Logları</h1>
          <p className="text-slate-500 text-sm">Son 24 saat istatistikleri gösteriliyor</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/logs/stats" className="text-sm text-blue-600 hover:underline">
            İstatistikler →
          </Link>
          <Link href="/admin/logs/telegram" className="text-sm text-blue-600 hover:underline">
            Telegram →
          </Link>
          <LogExportButton queryString={exportParams.toString()} />
        </div>
      </div>

      <LogStatsBar
        critical={levelMap["CRITICAL"] ?? 0}
        error={levelMap["ERROR"] ?? 0}
        warning={levelMap["WARNING"] ?? 0}
        info={levelMap["INFO"] ?? 0}
        total={(levelMap["DEBUG"] ?? 0) + (levelMap["INFO"] ?? 0) + (levelMap["WARNING"] ?? 0) + (levelMap["ERROR"] ?? 0) + (levelMap["CRITICAL"] ?? 0)}
      />

      <Suspense>
        <LogFilters />
      </Suspense>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Toplam {total.toLocaleString("tr-TR")} kayıt</span>
        <div className="flex items-center gap-2">
          <span>Sayfa başı:</span>
          {[25, 50, 100, 200].map((n) => (
            <Link
              key={n}
              href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(Object.entries(sp as Record<string, string>).filter(([, v]) => v !== undefined))), limit: String(n), page: "1" }).toString()}`}
              className={`px-2 py-0.5 rounded border text-xs ${limit === n ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-slate-50"}`}
            >
              {n}
            </Link>
          ))}
        </div>
      </div>

      <Suspense>
        <LogTable logs={logs} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(Object.entries(sp as Record<string, string>).filter(([, v]) => v !== undefined))), page: String(page - 1) })}`}
              className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
            >
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(Object.entries(sp as Record<string, string>).filter(([, v]) => v !== undefined))), page: String(page + 1) })}`}
              className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
