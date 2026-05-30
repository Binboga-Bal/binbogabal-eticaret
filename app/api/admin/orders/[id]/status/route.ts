import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusChangedEmail } from "@/lib/mail/mail.service";
import type { OrderStatus } from "@prisma/client";

const VALID: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUND_REQUESTED", "REFUNDED",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

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

  // Müşteriye bilgilendirme maili gönder
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
    // Misafir kullanıcı
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

  return NextResponse.json({ id: order.id, status: order.status });
}
