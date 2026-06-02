export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Kampanya Raporları | Admin" };

export default async function CampaignReportsPage() {
  await requirePermission("campaigns", "view");
  const [overview, topCampaigns, recentUsages] = await Promise.all([
    prisma.campaignUsage.aggregate({ _sum: { discountAmount: true }, _count: true }),
    prisma.campaign.findMany({
      orderBy: { usages: { _count: "desc" } },
      take: 10,
      include: {
        _count: { select: { usages: true } },
        usages: { select: { discountAmount: true } },
      },
    }),
    prisma.campaignUsage.findMany({
      orderBy: { usedAt: "desc" },
      take: 20,
      include: { campaign: { select: { name: true } } },
    }),
  ]);

  const stats = {
    totalDiscount: Number(overview._sum.discountAmount ?? 0),
    totalUsages: overview._count,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Kampanya Raporları</h1>

      {/* Genel */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium">Toplam Kullanım</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalUsages}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium">Toplam İndirim</p>
          <p className="text-3xl font-black text-honey-dark mt-1">
            {stats.totalDiscount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
          </p>
        </div>
      </div>

      {/* En iyi kampanyalar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b font-bold text-gray-800">En Çok Kullanılan Kampanyalar</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Kampanya</th>
              <th className="px-4 py-3 text-right">Kullanım</th>
              <th className="px-4 py-3 text-right">Toplam İndirim</th>
              <th className="px-4 py-3 text-right">Ort. İndirim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topCampaigns.map((c) => {
              const totalD = c.usages.reduce((s, u) => s + Number(u.discountAmount), 0);
              const avg = c._count.usages > 0 ? totalD / c._count.usages : 0;
              return (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-right font-mono">{c._count.usages}</td>
                  <td className="px-4 py-3 text-right font-mono text-honey-dark">
                    {totalD.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">
                    {avg.toFixed(0)} ₺
                  </td>
                </tr>
              );
            })}
            {topCampaigns.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Veri yok</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Son kullanımlar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b font-bold text-gray-800">Son Kullanımlar</div>
        <div className="divide-y divide-gray-50">
          {recentUsages.map((u) => (
            <div key={u.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{u.campaign.name}</p>
                <p className="text-xs text-gray-400">
                  {u.usedAt.toLocaleString("tr-TR")}
                  {u.customerId && ` · ${u.customerId.slice(-8)}`}
                </p>
              </div>
              <span className="text-sm font-bold text-honey-dark">
                -{Number(u.discountAmount).toLocaleString("tr-TR")} ₺
              </span>
            </div>
          ))}
          {recentUsages.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz kullanım yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
