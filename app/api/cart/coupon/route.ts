import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Kupon bulunamadı veya geçersiz" }, { status: 404 });
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return NextResponse.json({ error: "Kupon henüz aktif değil" }, { status: 400 });
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return NextResponse.json({ error: "Kuponun süresi dolmuş" }, { status: 400 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  }
  if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount.toString())) {
    return NextResponse.json({
      error: `Minimum sipariş tutarı ${coupon.minOrderAmount} TL olmalıdır`,
    }, { status: 400 });
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * parseFloat(coupon.discountValue.toString())) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, parseFloat(coupon.maxDiscount.toString()));
    }
  } else if (coupon.discountType === "FIXED") {
    discount = parseFloat(coupon.discountValue.toString());
  } else if (coupon.discountType === "FREE_SHIPPING") {
    discount = 99;
  }

  return NextResponse.json({ discount: Math.round(discount * 100) / 100 });
}
