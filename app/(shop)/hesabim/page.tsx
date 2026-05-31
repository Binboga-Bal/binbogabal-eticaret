import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Package, Star, Tag, AlertCircle } from "lucide-react";
import { CopyText } from "@/components/ui/CopyText";

export const metadata = { title: "Hesabım" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal",
  REFUND_REQUESTED: "İade Talebi", REFUNDED: "İade Edildi",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUND_REQUESTED: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const [orders, pendingReviewCount, expiringCoupons] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.orderItem.count({
      where: {
        reviewed: false,
        order: { userId: session.user.id, status: "DELIVERED" },
      },
    }),
    prisma.customerCoupon.findMany({
      where: {
        userId: session.user.id,
        usedAt: null,
        coupon: {
          isActive: true,
          expiresAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        },
      },
      include: { coupon: true },
      take: 3,
    }),
  ]);

  const allOrders = await prisma.order.findMany({ where: { userId: session.user.id }, select: { total: true } });
  const confirmedOrders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
    },
    select: { total: true },
  });
  const totalSpent = confirmedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = await prisma.order.count({ where: { userId: session.user.id, status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] } } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-500 mt-1">Hoş geldiniz, {session.user.name}</p>
      </div>

      {/* Uyarı kartları */}
      {pendingReviewCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Star size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{pendingReviewCount} ürün</strong> için yorum bekleniyor.{" "}
            <Link href="/hesabim/yorumlarim/bekleyenler" className="underline font-semibold">Yorum yaz</Link>
          </p>
        </div>
      )}
      {expiringCoupons.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-800">
            <strong>{expiringCoupons.length} kuponunuzun</strong> süresi 3 gün içinde doluyor.{" "}
            <Link href="/hesabim/kuponlarim" className="underline font-semibold">Görüntüle</Link>
          </p>
        </div>
      )}

      {/* İstatistik sayaçları */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Sipariş", value: allOrders.length, icon: <Package size={20} />, href: "/hesabim/siparislerim" },
          { label: "Bekleyen Sipariş", value: pendingOrders, icon: <Package size={20} />, href: "/hesabim/siparislerim" },
          { label: "Toplam Harcama", value: formatPrice(totalSpent), icon: <Tag size={20} />, href: "/hesabim/siparislerim" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-2 hover:border-honey-dark transition-colors text-center card-hover"
          >
            <div className="text-honey-dark">{stat.icon}</div>
            <p className="text-xl font-black text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Son siparişler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Son Siparişler</h2>
          <Link href="/hesabim/siparislerim" className="text-sm text-honey-dark font-semibold hover:underline">Tümünü gör</Link>
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Henüz siparişiniz yok</p>
            <Link href="/urunlerimiz" className="btn-primary inline-flex mt-4 text-sm">Alışverişe Başla</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/hesabim/siparislerim/${order.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between gap-4 hover:border-honey-dark transition-colors block"
              >
                <div>
                  <CopyText text={order.orderNumber} className="font-bold text-honey-dark" />
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} ürün</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">{formatPrice(Number(order.total))}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
