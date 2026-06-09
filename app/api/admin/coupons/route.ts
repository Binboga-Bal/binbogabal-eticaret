import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@prisma/client";
import { logAction } from "@/lib/audit/logger";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();

  const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
  if (existing) return NextResponse.json({ error: "Bu kod zaten kullanımda" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code,
      discountType: body.discountType as DiscountType,
      discountValue: body.discountValue,
      minOrderAmount: body.minOrderAmount ?? null,
      maxUses: body.maxUses ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    },
  });

  await logAction({ adminId: session.adminId, action: "create", module: "coupons", targetId: coupon.id, targetLabel: coupon.code, newData: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, req });

  return NextResponse.json(coupon);
}
