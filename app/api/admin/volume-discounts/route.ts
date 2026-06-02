import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "volume_discounts", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const rules = await prisma.volumeDiscount.findMany({
    include: {
      products: {
        include: {
          product: { select: { id: true, name: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "volume_discounts", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { name, isActive, tiers, productIds } = await req.json();

  if (!name || !tiers?.length) {
    return NextResponse.json({ error: "Ad ve en az bir kademe zorunludur." }, { status: 400 });
  }

  const rule = await prisma.volumeDiscount.create({
    data: {
      name,
      isActive: isActive ?? true,
      tiers,
      products: productIds?.length
        ? { create: productIds.map((productId: string) => ({ productId })) }
        : undefined,
    },
    include: { products: { include: { product: { select: { id: true, name: true, images: true } } } } },
  });

  return NextResponse.json(rule);
}
