export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { BulkCouponForm } from "@/components/admin/campaign/BulkCouponForm";
import Link from "next/link";

export const metadata = { title: "Kuponlar | Admin" };

export default async function CouponsAdminPage() {
  const coupons = await prisma.coupon.findMany({
    include: { campaign: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Kupon Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kupon listesi */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b font-bold text-gray-800">Son Kuponlar ({coupons.length})</div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold bg-honey-cream px-2 py-0.5 rounded text-honey-dark">
                        {coupon.code}
                      </code>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>{coupon.isActive ? "Aktif" : "Pasif"}</span>
                      {coupon.isBulk && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Toplu</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {coupon.discountType === "PERCENTAGE" ? `%${coupon.discountValue} indirim`
                      : coupon.discountType === "FIXED" ? `${formatPrice(Number(coupon.discountValue))} indirim`
                      : "Ücretsiz kargo"}
                      {coupon.minOrderAmount ? ` · min ${formatPrice(Number(coupon.minOrderAmount))}` : ""}
                    </p>
                    {coupon.campaign && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Kampanya: <Link href={`/admin/kampanyalar/${coupon.campaignId}`} className="text-honey-dark hover:underline">{coupon.campaign.name}</Link>
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400 flex-shrink-0">
                    <p>{coupon.usedCount}/{coupon.maxUses ?? "∞"} kullanım</p>
                    {coupon.expiresAt && <p>Bitiş: {formatDate(coupon.expiresAt)}</p>}
                  </div>
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz kupon yok</p>
            )}
          </div>
        </div>

        {/* Toplu kupon üretimi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-5">Toplu Kupon Üret</h2>
          <BulkCouponForm />
        </div>
      </div>
    </div>
  );
}
