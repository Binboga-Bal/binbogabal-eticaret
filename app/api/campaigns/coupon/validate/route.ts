import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/campaign/rate-limiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen 15 dakika bekleyin." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const { code, orderAmount } = await req.json();
  const now = new Date();

  const coupon = await prisma.coupon.findUnique({
    where: { code: (code as string).toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json(
      { error: "Geçersiz kupon kodu" },
      { status: 400, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "Kupon henüz aktif değil" }, { status: 400 });
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ error: "Kuponun süresi dolmuş" }, { status: 400 });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  }
  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return NextResponse.json({
      error: `Minimum sipariş tutarı ${Number(coupon.minOrderAmount).toFixed(2)} ₺ olmalıdır`,
    }, { status: 400 });
  }

  // Başarılı doğrulamada rate limit sıfırla
  resetRateLimit(ip);

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (orderAmount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else if (coupon.discountType === "FIXED") {
    discount = Math.min(Number(coupon.discountValue), orderAmount);
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    },
    discount,
  });
}
