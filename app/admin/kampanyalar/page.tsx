import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata = { title: "Kampanyalar | Admin" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Kuponlar & Kampanyalar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mevcut kuponlar */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b font-bold text-gray-800">Kuponlar ({coupons.length})</div>
          <div className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold bg-honey-cream px-2 py-0.5 rounded text-honey-dark">
                        {coupon.code}
                      </code>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>{coupon.isActive ? "Aktif" : "Pasif"}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {coupon.discountType === "PERCENTAGE" ? `%${coupon.discountValue} indirim`
                      : coupon.discountType === "FIXED" ? `${formatPrice(Number(coupon.discountValue))} indirim`
                      : "Ücretsiz kargo"}
                      {coupon.minOrderAmount ? ` · min ${formatPrice(Number(coupon.minOrderAmount))}` : ""}
                    </p>
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

        {/* Yeni kupon */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-5">Yeni Kupon Oluştur</h2>
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
