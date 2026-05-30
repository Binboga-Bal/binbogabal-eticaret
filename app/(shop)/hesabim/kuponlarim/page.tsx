import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tag, Copy } from "lucide-react";
import { CopyButton } from "./CopyButton";

export const metadata = { title: "Kuponlarım" };

function formatDiscount(type: string, value: number) {
  if (type === "PERCENTAGE") return `%${value} indirim`;
  if (type === "FIXED") return `${value} ₺ indirim`;
  return "Ücretsiz kargo";
}

function couponStatus(cc: { usedAt: Date | null; coupon: { isActive: boolean; expiresAt: Date | null } }) {
  if (cc.usedAt) return { label: "Kullanıldı", color: "bg-gray-100 text-gray-500" };
  if (!cc.coupon.isActive) return { label: "Pasif", color: "bg-gray-100 text-gray-500" };
  if (cc.coupon.expiresAt && cc.coupon.expiresAt < new Date()) return { label: "Süresi Doldu", color: "bg-red-100 text-red-600" };
  return { label: "Aktif", color: "bg-green-100 text-green-700" };
}

export default async function KuponlarimPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const customerCoupons = await prisma.customerCoupon.findMany({
    where: { userId: session.user.id },
    include: { coupon: true },
    orderBy: { assignedAt: "desc" },
  });

  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Kuponlarım</h1>
      {customerCoupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <Tag size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Henüz kuponunuz yok</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {customerCoupons.map((cc) => {
            const { label, color } = couponStatus(cc);
            const isExpiringSoon = !cc.usedAt && cc.coupon.expiresAt && cc.coupon.expiresAt > now && cc.coupon.expiresAt <= threeDays;
            const discountLabel = formatDiscount(cc.coupon.discountType, Number(cc.coupon.discountValue));

            return (
              <div key={cc.id} className={`bg-white rounded-2xl border-2 p-5 ${isExpiringSoon ? "border-red-200" : "border-dashed border-honey"}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xl font-black tracking-widest text-honey-dark">{cc.coupon.code}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{discountLabel}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${color}`}>{label}</span>
                </div>
                {cc.coupon.minOrderAmount && (
                  <p className="text-xs text-gray-400">Min. sepet: {Number(cc.coupon.minOrderAmount).toFixed(2)} ₺</p>
                )}
                {cc.coupon.expiresAt && (
                  <p className={`text-xs mt-1 ${isExpiringSoon ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                    Son kullanım: {cc.coupon.expiresAt.toLocaleDateString("tr-TR")}
                    {isExpiringSoon && " ⚠️ Yakında doluyor!"}
                  </p>
                )}
                {!cc.usedAt && cc.coupon.isActive && (
                  <CopyButton code={cc.coupon.code} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
