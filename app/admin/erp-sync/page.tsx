export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { ErpSyncButtons } from "@/components/admin/ErpSyncButtons";

export const metadata = { title: "ERP Senkronizasyon | Admin" };

export default async function ErpSyncPage() {
  await requirePermission("erp", "view");
  const logs = await prisma.erpSyncLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dia ERP Senkronizasyon</h1>
        <p className="text-sm text-gray-500 mt-1">Ürün, stok ve fiyat verilerini ERP ile senkronize edin</p>
      </div>

      <ErpSyncButtons />

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Senkronizasyon Geçmişi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tür</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kayıt Sayısı</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Başlangıç</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bitiş</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mesaj</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{log.syncType}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      log.status === "SUCCESS" ? "bg-green-100 text-green-700"
                      : log.status === "FAILED" ? "bg-red-100 text-red-700"
                      : log.status === "RUNNING" ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{log.recordCount ?? "-"}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{log.completedAt ? formatDate(log.completedAt) : "-"}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{log.message ?? "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">Henüz senkronizasyon yapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
