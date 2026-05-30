import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

const schema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz ürün" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    create: { userId: user.id, productId: parsed.data.productId },
    update: {},
  });

  return NextResponse.json(favorite, { status: 201 });
}
