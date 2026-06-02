import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RiskScoreBadge } from "@/components/admin/rbac/RiskScoreBadge";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; module?: string; action?: string; minRisk?: string }>;
}) {
  await requirePermission("audit_log", "view");

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const limit = 50;
  const module = sp.module;
  const action = sp.action;
  const minRisk = parseInt(sp.minRisk ?? "0");

  const where = {
    ...(module ? { module } : {}),
    ...(action ? { action } : {}),
    ...(minRisk > 0 ? { riskScore: { gte: minRisk } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const modules = await prisma.auditLog.findMany({
    select: { module: true },
    distinct: ["module"],
    orderBy: { module: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">{total} kayıt</p>
        </div>
        <Link href="/admin/audit-log/risk-alerts"
          className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition">
          ⚠️ Risk Uyarıları
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-4 flex-wrap">
        <select name="module" defaultValue={module ?? ""}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">Tüm Modüller</option>
          {modules.map((m) => <option key={m.module} value={m.module}>{m.module}</option>)}
        </select>
        <input type="text" name="action" defaultValue={action}
          placeholder="İşlem filtrele..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <select name="minRisk" defaultValue={String(minRisk)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="0">Tüm Risk Seviyeleri</option>
          <option value="25">Orta+</option>
          <option value="50">Yüksek+</option>
          <option value="80">Kritik</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Filtrele</button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Tarih</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Admin</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">İşlem</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Modül</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Hedef</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">IP</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Kayıt bulunamadı</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className={`hover:bg-gray-50 ${log.riskScore >= 80 ? "bg-red-50" : log.riskScore >= 50 ? "bg-orange-50" : ""}`}>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-gray-900 font-medium">{log.admin?.name ?? log.adminName ?? "—"}</div>
                    <div className="text-xs text-gray-400">{log.admin?.email ?? ""}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-5 py-3 text-gray-600">{log.module}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{log.targetLabel ?? log.targetId ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{log.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3"><RiskScoreBadge score={log.riskScore} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">{total} kayıttan {(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}${module ? `&module=${module}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Önceki</Link>}
              {page < totalPages && <Link href={`?page=${page + 1}${module ? `&module=${module}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Sonraki</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
