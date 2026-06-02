export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, formatWeight } from "@/lib/utils/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Sipariş Detayı | Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal", REFUNDED: "İade",
};
const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", PAID: "Ödendi", FAILED: "Başarısız", REFUNDED: "İade",
};

export default async function OrderDetailPage({ params }: PageProps) {
  await requirePermission("orders", "view");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { variant: { include: { product: { select: { slug: true } } } } } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const addr = order.shippingAddress as Record<string, string>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/siparisler" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sol: Ürünler + İşlemler */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ürünler */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b font-bold text-gray-800">
              Ürünler ({order.items.length})
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.variantInfo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">
                      {formatPrice(Number(item.price))} × {item.quantity}
                    </p>
                    <p className="text-sm font-black text-honey-dark">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span><span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>{Number(order.shippingFee) === 0 ? "Ücretsiz" : formatPrice(Number(order.shippingFee))}</span>
              </div>
              <div className="flex justify-between font-black text-base border-t pt-2">
                <span>Toplam</span>
                <span className="text-honey-dark">{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Ödeme işlemleri */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b font-bold text-gray-800">Ödeme İşlemleri</div>
            <div className="divide-y divide-gray-100">
              {order.transactions.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{t.provider}</span>
                    <span className="text-gray-400 ml-2">{formatDate(t.createdAt)}</span>
                    {t.providerRefId && <span className="text-xs text-gray-400 ml-2">#{t.providerRefId}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(Number(t.amount))}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      t.status === "SUCCESS" ? "bg-green-100 text-green-700"
                      : t.status === "FAILED" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>{t.status}</span>
                  </div>
                </div>
              ))}
              {order.transactions.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400">İşlem bulunamadı</p>
              )}
            </div>
          </div>
        </div>

        {/* Sağ: Müşteri + Adres + Durum */}
        <div className="space-y-5">
          {/* Özet */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-800">Sipariş Özeti</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Durum</span>
                <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                  order.status === "DELIVERED" ? "bg-green-100 text-green-700"
                  : order.status === "CANCELLED" ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
                }`}>{STATUS_LABELS[order.status] ?? order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ödeme</span>
                <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "PAID" ? "bg-green-100 text-green-700"
                  : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>{PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</span>
              </div>
              {order.erpOrderCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ERP Kodu</span>
                  <span className="font-mono text-xs">{order.erpOrderCode}</span>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Not:</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Müşteri */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3">Müşteri</h3>
            {order.user ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.user.name}</p>
                <p className="text-gray-500">{order.user.email}</p>
                {order.user.phone && <p className="text-gray-500">{order.user.phone}</p>}
                <Link href={`/admin/musteriler?id=${order.user.id}`} className="text-xs text-honey-dark hover:underline">
                  Profili gör →
                </Link>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Misafir Alışveriş</p>
                {order.guestEmail && <p>{order.guestEmail}</p>}
                {order.guestPhone && <p>{order.guestPhone}</p>}
              </div>
            )}
          </div>

          {/* Teslimat adresi */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3">Teslimat Adresi</h3>
            <address className="text-sm text-gray-600 not-italic space-y-0.5">
              <p className="font-semibold text-gray-800">{addr.firstName} {addr.lastName}</p>
              {addr.phone && <p>{addr.phone}</p>}
              <p>{addr.fullAddress}</p>
              <p>{addr.district} / {addr.city}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
