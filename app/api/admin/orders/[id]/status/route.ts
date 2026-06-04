import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusChangedEmail } from "@/lib/mail/mail.service";
import type { OrderStatus } from "@prisma/client";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const VALID: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUND_REQUESTED", "REFUNDED",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "orders", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const { status, cargoTrackingNo, cargoCompany } = await req.json();

  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      ...(cargoTrackingNo && { cargoTrackingNo }),
      ...(cargoCompany && { cargoCompany }),
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (order.user) {
    await sendOrderStatusChangedEmail(
      order.user.id,
      order.user.email,
      order.user.name ?? "Müşterimiz",
      order.orderNumber,
      order.id,
      status,
      order.cargoTrackingNo ?? undefined,
      order.cargoCompany ?? undefined,
    ).catch((err) => console.error("[admin-status] mail hata:", err));
  } else if (order.guestEmail) {
    const shippingAddr = order.shippingAddress as Record<string, string>;
    await sendOrderStatusChangedEmail(
      "",
      order.guestEmail,
      shippingAddr.firstName ?? "Müşterimiz",
      order.orderNumber,
      order.id,
      status,
      order.cargoTrackingNo ?? undefined,
      order.cargoCompany ?? undefined,
    ).catch((err) => console.error("[admin-status] guest mail hata:", err));
  }

  void createLog({
    level: "INFO",
    category: "ORDER",
    action: LOG_ACTIONS.ORDER_STATUS_CHANGED,
    message: `Sipariş durumu güncellendi: #${order.orderNumber} → ${status}`,
    actorId: session.adminId,
    actorEmail: session.email,
    actorRole: session.isSuperAdmin ? "SUPERADMIN" : "ADMIN",
    targetType: "Order",
    targetId: order.id,
    targetLabel: `Sipariş #${order.orderNumber}`,
    detail: { newStatus: status, cargoTrackingNo, cargoCompany },
    method: "PATCH",
    path: `/api/admin/orders/${id}/status`,
  });

  return NextResponse.json({ id: order.id, status: order.status });
}
