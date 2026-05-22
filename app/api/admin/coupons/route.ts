import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

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

  return NextResponse.json(coupon);
}
