import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";
import { z } from "zod";

const schema = z.object({ reason: z.string().min(10) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  if (order.userId !== user.id) return forbidden();

  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Yalnızca teslim edilmiş siparişler için iade talep edilebilir" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "İade nedeni belirtiniz" }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "REFUND_REQUESTED", refundReason: parsed.data.reason },
  });

  return NextResponse.json(updated);
}
