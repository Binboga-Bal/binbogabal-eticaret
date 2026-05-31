import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CampaignStatusBadge } from "@/components/admin/campaign/CampaignStatusBadge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function CampaignStatsPage({ params }: Props) {
  const { id } = await params;

  const [campaign, usages] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { abTests: true },
    }),
    prisma.campaignUsage.findMany({
      where: { campaignId: id },
      orderBy: { usedAt: "asc" },
      take: 1000,
    }),
  ]);

  if (!campaign) notFound();

  const totalDiscount = usages.reduce((s, u) => s + Number(u.discountAmount), 0);
  const uniqueCustomers = new Set(usages.map((u) => u.customerId).filter(Boolean)).size;

  const byDay = usages.reduce<Record<string, number>>((acc, u) => {
    const day = u.usedAt.toISOString().split("T")[0];
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const budgetPct = campaign.budgetLimit
    ? Math.min(100, (Number(campaign.budgetUsed) / Number(campaign.budgetLimit)) * 100)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/kampanyalar/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-gray-500">Performans İstatistikleri</p>
        </div>
      </div>

      {/* Metrik kartlar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Toplam Kullanım", value: usages.length, color: "text-gray-900" },
          { label: "Toplam İndirim", value: `${totalDiscount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺`, color: "text-honey-dark" },
          { label: "Benzersiz Müşteri", value: uniqueCustomers, color: "text-blue-700" },
          { label: "Ort. İndirim", value: usages.length ? `${(totalDiscount / usages.length).toFixed(0)} ₺` : "—", color: "text-green-700" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-500 font-medium">{m.label}</p>
            <p className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Bütçe progress */}
      {budgetPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Bütçe Kullanımı</span>
            <span className="text-sm text-gray-500">
              {Number(campaign.budgetUsed).toLocaleString("tr-TR")} / {Number(campaign.budgetLimit).toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPct >= 90 ? "bg-red-500" : budgetPct >= 70 ? "bg-orange-400" : "bg-green-500"}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{budgetPct.toFixed(1)}% kullanıldı</p>
        </div>
      )}

      {/* Günlük kullanım */}
      {Object.keys(byDay).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">Günlük Kullanım</h3>
          <div className="space-y-2">
            {Object.entries(byDay).slice(-14).map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{day}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-honey/70 rounded-full"
                    style={{ width: `${Math.min(100, (count / Math.max(...Object.values(byDay))) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-700 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A/B Test sonuçları */}
      {campaign.abTests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b font-bold text-gray-800">A/B Test Sonuçları</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Varyant</th>
                <th className="px-5 py-3 text-right">Trafik %</th>
                <th className="px-5 py-3 text-right">Görüntülenme</th>
                <th className="px-5 py-3 text-right">Dönüşüm</th>
                <th className="px-5 py-3 text-right">CVR</th>
                <th className="px-5 py-3 text-right">Gelir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaign.abTests.map((v) => (
                <tr key={v.id} className={v.isWinner ? "bg-green-50" : ""}>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {v.variantName} {v.isWinner && <span className="text-green-600 text-xs">🏆 Kazanan</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">%{v.trafficSplit}</td>
                  <td className="px-5 py-3 text-right font-mono">{v.impressions}</td>
                  <td className="px-5 py-3 text-right font-mono">{v.conversions}</td>
                  <td className="px-5 py-3 text-right font-mono">
                    {v.impressions > 0 ? `${((v.conversions / v.impressions) * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono">{Number(v.revenue).toLocaleString("tr-TR")} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
