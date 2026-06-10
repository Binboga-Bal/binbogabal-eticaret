import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import type { OrderStatus } from "@prisma/client";
import { getOrderDateRange } from "@/lib/utils/order-date-range";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade Edildi",
  REFUND_REQUESTED: "İade Talep Edildi",
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade",
  PARTIALLY_REFUNDED: "Kısmi İade",
};

const fmt = new Intl.DateTimeFormat("tr-TR", {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
});

export async function GET(req: NextRequest) {
  await requirePermission("orders", "view");

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "xlsx";
  const rawStatus = searchParams.get("durum");
  const preset = searchParams.get("preset");

  const validStatus =
    rawStatus && VALID_STATUSES.includes(rawStatus as OrderStatus)
      ? (rawStatus as OrderStatus)
      : undefined;

  const dateRange = getOrderDateRange(preset);

  const orders = await prisma.order.findMany({
    where: {
      ...(validStatus && { status: validStatus }),
      ...(dateRange && { createdAt: dateRange }),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  if (format === "json") {
    return NextResponse.json(orders);
  }

  // XLSX
  const rows: (string | number)[][] = [
    ["Sipariş No", "Tarih", "Müşteri", "E-posta", "Toplam (₺)", "Ödeme Durumu", "Sipariş Durumu", "ERP Kodu"],
    ...orders.map((o) => [
      o.orderNumber,
      fmt.format(o.createdAt),
      o.user?.name ?? "Misafir",
      o.user?.email ?? o.guestEmail ?? "",
      Number(o.total),
      PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus,
      STATUS_LABELS[o.status] ?? o.status,
      o.erpOrderCode ?? "",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 22 }, { wch: 18 }, { wch: 25 }, { wch: 32 },
    { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Siparişler");

  const rawBuf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const ab = rawBuf.buffer.slice(rawBuf.byteOffset, rawBuf.byteOffset + rawBuf.byteLength) as ArrayBuffer;
  const filename = `siparisler-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(ab, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
