import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { CampaignStatusBadge } from "@/components/admin/campaign/CampaignStatusBadge";
import { CampaignActions } from "@/components/admin/campaign/CampaignActions";
import { Plus, Calendar, BarChart2 } from "lucide-react";

export const metadata = { title: "Kampanyalar | Admin" };

const TYPE_LABELS: Record<string, string> = {
  COUPON: "Kupon",
  CART_DISCOUNT: "Sepet İndirimi",
  PRODUCT_DISCOUNT: "Ürün İndirimi",
  FREE_SHIPPING: "Ücretsiz Kargo",
  BUY_X_PAY_Y: "X Al Y Öde",
  GIFT_PRODUCT: "Hediye Ürün",
  FLASH_SALE: "Flash Sale",
  CASHBACK: "Cashback",
  BIRTHDAY: "Doğum Günü",
  WIN_BACK: "Geri Kazanım",
  ABANDONED_CART: "Terk Edilmiş Sepet",
};

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { _count: { select: { usages: true, coupons: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  const activeCnt = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalDiscount = await prisma.campaignUsage.aggregate({ _sum: { discountAmount: true } });

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kampanyalar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCnt} aktif · Toplam {campaigns.length} kampanya
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/kampanyalar/calendar"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Calendar size={15} />
            Takvim
          </Link>
          <Link
            href="/admin/kampanyalar/reports"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <BarChart2 size={15} />
            Raporlar
          </Link>
          <Link
            href="/admin/kampanyalar/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark"
          >
            <Plus size={15} />
            Yeni Kampanya
          </Link>
        </div>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium">Aktif Kampanya</p>
          <p className="text-3xl font-black text-green-600 mt-1">{activeCnt}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium">Toplam Kullanım</p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {campaigns.reduce((s, c) => s + c._count.usages, 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium">Toplam İndirim</p>
          <p className="text-3xl font-black text-honey-dark mt-1">
            {Number(totalDiscount._sum.discountAmount ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
          </p>
        </div>
      </div>

      {/* Kampanya tablosu */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <span className="font-bold text-gray-800">Tüm Kampanyalar ({campaigns.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Kampanya</th>
                <th className="px-4 py-3 text-left">Tip</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-right">Kullanım</th>
                <th className="px-4 py-3 text-right">Kupon</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/kampanyalar/${c.id}`} className="font-semibold text-gray-900 hover:text-honey-dark">
                      {c.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">Öncelik: {c.priority}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[c.type] ?? c.type}</td>
                  <td className="px-4 py-3">
                    <CampaignStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <div>{formatDate(c.startsAt)}</div>
                    {c.endsAt && <div className="text-gray-400">→ {formatDate(c.endsAt)}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{c._count.usages}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{c._count.coupons}</td>
                  <td className="px-4 py-3 text-right">
                    <CampaignActions campaignId={c.id} status={c.status} />
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    Henüz kampanya yok.{" "}
                    <Link href="/admin/kampanyalar/new" className="text-honey-dark underline">
                      İlk kampanyayı oluştur
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
