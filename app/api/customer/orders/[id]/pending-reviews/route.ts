import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        where: { reviewed: false },
        include: { variant: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } } },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  if (order.userId !== user.id) return forbidden();
  if (order.status !== "DELIVERED") return NextResponse.json([]);

  return NextResponse.json(order.items);
}
