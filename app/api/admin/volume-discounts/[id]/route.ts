import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit/logger";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "volume_discounts", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const { name, isActive, tiers, productIds } = await req.json();

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

  await logAction({ adminId: session.adminId, action: "update", module: "volume_discounts", targetId: rule.id, targetLabel: rule.name, req });

  return NextResponse.json(rule);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "volume_discounts", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const rule = await prisma.volumeDiscount.findUnique({ where: { id }, select: { name: true } });
  await prisma.volumeDiscount.delete({ where: { id } });
  await logAction({ adminId: session.adminId, action: "delete", module: "volume_discounts", targetId: id, targetLabel: rule?.name ?? id, req: _req });
  return NextResponse.json({ ok: true });
}
