import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCouponExpiryEmail } from "@/lib/mail/mail.service";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

function formatDiscount(type: string, value: number) {
  if (type === "PERCENTAGE") return `%${value} indirim`;
  if (type === "FIXED") return `${value} ₺ indirim`;
  return "Ücretsiz kargo";
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const expiringCoupons = await prisma.customerCoupon.findMany({
    where: {
      usedAt: null,
      coupon: {
        isActive: true,
        expiresAt: { gte: now, lte: threeDaysLater },
      },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      coupon: true,
    },
  });

  let sent = 0;
  for (const cc of expiringCoupons) {
    const expiresAt = cc.coupon.expiresAt!;
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const discountLabel = formatDiscount(cc.coupon.discountType, Number(cc.coupon.discountValue));

    await sendCouponExpiryEmail(
      cc.user.id,
      cc.user.email,
      cc.user.name ?? "Müşterimiz",
      cc.coupon.code,
      discountLabel,
      expiresAt.toLocaleDateString("tr-TR"),
      daysLeft,
    ).catch(() => null);
    sent++;
  }

  return NextResponse.json({ sent });
}
