import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

const createSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().optional(),
  orderItemId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { product: { select: { name: true, slug: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  // Sipariş kontrolü — yalnızca satın alınan ürünlere yorum yapılabilir
  if (parsed.data.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: user.id, status: "DELIVERED" },
    });
    if (!order) return NextResponse.json({ error: "Bu sipariş için yorum yapılamaz" }, { status: 403 });
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: parsed.data.productId, userId: user.id } },
  });
  if (existing) return NextResponse.json({ error: "Bu ürün için zaten yorum yaptınız" }, { status: 400 });

  const review = await prisma.review.create({
    data: { ...parsed.data, userId: user.id },
  });

  // Sipariş ürününü yorumlandı olarak işaretle
  if (parsed.data.orderItemId) {
    await prisma.orderItem.update({ where: { id: parsed.data.orderItemId }, data: { reviewed: true } });
  }

  return NextResponse.json(review, { status: 201 });
}
