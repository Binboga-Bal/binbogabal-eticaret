import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Package } from "lucide-react";

export const metadata = { title: "Siparişlerim" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal",
  REFUND_REQUESTED: "İade Talebi", REFUNDED: "İade Edildi",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700", SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
  REFUND_REQUESTED: "bg-orange-100 text-orange-700", REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function SiparislerimPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Siparişlerim</h1>
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
                <p className="font-bold text-honey-dark">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} ürün</p>
                {order.cargoTrackingNo && (
                  <p className="text-xs text-purple-600 mt-1">Kargo: {order.cargoCompany} · {order.cargoTrackingNo}</p>
                )}
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
  );
}
