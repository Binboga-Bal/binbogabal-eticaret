import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";
import { sendOrderStatusChangedEmail } from "@/lib/mail/mail.service";
import { z } from "zod";

const schema = z.object({ reason: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  if (order.userId !== user.id) return forbidden();

  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    return NextResponse.json({ error: "Bu sipariş iptal edilemez" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelReason: parsed.success ? parsed.data.reason : undefined,
    },
  });

  if (order.user) {
    await sendOrderStatusChangedEmail(
      order.user.id,
      order.user.email,
      order.user.name ?? "Müşterimiz",
      order.orderNumber,
      order.id,
      "CANCELLED",
    ).catch((err) => console.error("[cancel] mail hata:", err));
  }

  return NextResponse.json(updated);
}
