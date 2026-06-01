export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { CancelOrderButton } from "./CancelOrderButton";
import { CopyText } from "@/components/ui/CopyText";

export const metadata = { title: "Sipariş Detayı" };

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal Edildi",
  REFUND_REQUESTED: "İade Talebi", REFUNDED: "İade Edildi",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700", SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
  REFUND_REQUESTED: "bg-orange-100 text-orange-700", REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function SiparisDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: { select: { name: true, slug: true, images: true } } } } } } },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const shippingAddr = order.shippingAddress as Record<string, string>;
  const activeStep = STATUS_STEPS.indexOf(order.status);
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/hesabim/siparislerim" className="text-sm text-gray-400 hover:text-gray-600">← Siparişlerim</Link>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            <CopyText text={order.orderNumber} />
          </h1>
          <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Timeline */}
      {!["CANCELLED", "REFUND_REQUESTED", "REFUNDED"].includes(order.status) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i <= activeStep ? "bg-honey text-white" : "bg-gray-100 text-gray-400"}`}>
                  {i + 1}
                </div>
                <p className={`text-xs text-center ${i <= activeStep ? "text-honey-dark font-semibold" : "text-gray-400"}`}>
                  {STATUS_LABELS[step]}
                </p>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="absolute" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kargo bilgisi */}
      {order.cargoTrackingNo && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-800">Kargo Takip Bilgisi</p>
          <p className="text-sm text-purple-700 mt-1">
            {order.cargoCompany} · <CopyText text={order.cargoTrackingNo!} className="font-bold" />
          </p>
        </div>
      )}

      {/* Ürünler */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">Ürünler</h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            const images = item.variant.product.images as string[];
            return (
              <div key={item.id} className="flex items-center gap-4">
                {images[0] && (
                  <img src={images[0]} alt={item.productName} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.variantInfo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatPrice(Number(item.price) * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{item.quantity} adet</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tutar özeti */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Ara Toplam</span><span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>İndirim</span><span>-{formatPrice(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Kargo</span><span>{Number(order.shippingFee) === 0 ? "Ücretsiz" : formatPrice(Number(order.shippingFee))}</span>
          </div>
          <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100">
            <span>Toplam</span><span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Teslimat adresi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-3">Teslimat Adresi</h2>
        <p className="text-sm text-gray-600">{shippingAddr.fullName ?? `${shippingAddr.firstName ?? ""} ${shippingAddr.lastName ?? ""}`}</p>
        <p className="text-sm text-gray-600">{shippingAddr.fullAddress}</p>
        <p className="text-sm text-gray-600">{shippingAddr.district}, {shippingAddr.city}</p>
        <p className="text-sm text-gray-600">{shippingAddr.phone}</p>
      </div>

      {/* İptal butonu */}
      {canCancel && <CancelOrderButton orderId={order.id} />}
    </div>
  );
}
