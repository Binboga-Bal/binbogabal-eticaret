import { requireSuperAdmin } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RiskScoreBadge } from "@/components/admin/rbac/RiskScoreBadge";

export const dynamic = "force-dynamic";

export default async function RiskAlertsPage() {
  await requireSuperAdmin();

  const logs = await prisma.auditLog.findMany({
    where: { riskScore: { gte: 50 } },
    take: 100,
    orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
    include: { admin: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/audit-log" className="text-sm text-gray-500 hover:underline">← Audit Log</Link>
        <h1 className="text-2xl font-bold text-gray-900">Risk Uyarıları</h1>
      </div>

      {logs.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center text-green-700">
          Yüksek riskli işlem tespit edilmedi ✅
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Risk</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tarih</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Admin</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">İşlem</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Modül</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className={log.riskScore >= 80 ? "bg-red-50" : "bg-orange-50"}>
                  <td className="px-5 py-3"><RiskScoreBadge score={log.riskScore} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("tr-TR")}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{log.admin?.name ?? log.adminName ?? "—"}</div>
                    <div className="text-xs text-gray-400">{log.admin?.email}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-5 py-3">{log.module}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
