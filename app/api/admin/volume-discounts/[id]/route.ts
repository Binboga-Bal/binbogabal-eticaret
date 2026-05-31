import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const { name, isActive, tiers, productIds } = await req.json();

  // Ürün bağlantılarını yeniden kur
  await prisma.volumeDiscountProduct.deleteMany({ where: { volumeDiscountId: id } });

  const rule = await prisma.volumeDiscount.update({
    where: { id },
    data: {
      name,
      isActive,
      tiers,
      products: productIds?.length
        ? { create: productIds.map((productId: string) => ({ productId })) }
        : undefined,
    },
    include: { products: { include: { product: { select: { id: true, name: true, images: true } } } } },
  });

  return NextResponse.json(rule);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.volumeDiscount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
