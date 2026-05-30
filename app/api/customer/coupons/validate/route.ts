import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1), orderAmount: z.number().positive() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { code, orderAmount } = parsed.data;
  const now = new Date();

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Geçersiz kupon kodu" }, { status: 400 });
  }
  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "Kupon henüz aktif değil" }, { status: 400 });
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ error: "Kuponun süresi dolmuş" }, { status: 400 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  }
  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return NextResponse.json({
      error: `Minimum sipariş tutarı ${Number(coupon.minOrderAmount).toFixed(2)} ₺ olmalıdır`,
    }, { status: 400 });
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (orderAmount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else if (coupon.discountType === "FIXED") {
    discount = Math.min(Number(coupon.discountValue), orderAmount);
  } else if (coupon.discountType === "FREE_SHIPPING") {
    discount = 0; // kargo ücreti hesabı sipariş oluşturulurken yapılır
  }

  return NextResponse.json({
    valid: true,
    coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: Number(coupon.discountValue) },
    discount,
  });
}
