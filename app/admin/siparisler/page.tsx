import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { OrderStatus } from "@prisma/client";

export const metadata = { title: "Sipariş Yönetimi | Admin" };

interface PageProps {
  searchParams: Promise<{ durum?: string; sayfa?: string }>;
}

const STATUS_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 20;

const VALID_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawStatus = params.durum;
  const status = VALID_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;
  const page = parseInt(params.sayfa ?? "1");

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({
      where: status ? { status } : undefined,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Siparişler</h1>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/siparisler${opt.value ? `?durum=${opt.value}` : ""}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (rawStatus ?? "") === opt.value
                ? "bg-honey-dark text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Sipariş No", "Tarih", "Müşteri", "Tutar", "Ödeme", "Durum", "ERP", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-bold text-honey-dark">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.user?.name ?? "Misafir"}</p>
                    <p className="text-xs text-gray-400">{order.user?.email ?? order.guestEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-bold">{formatPrice(Number(order.total))}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.paymentStatus === "PAID" ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_OPTIONS.find((o) => o.value === order.status)?.label ?? order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{order.erpOrderCode ?? "-"}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/siparisler/${order.id}`} className="text-xs font-semibold text-honey-dark hover:underline">
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    Henüz sipariş bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/siparisler?${new URLSearchParams({ ...(status ? { durum: status } : {}), sayfa: String(p) })}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${
                p === page ? "bg-honey-dark text-white" : "border border-gray-200 text-gray-600 hover:border-honey-dark"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
