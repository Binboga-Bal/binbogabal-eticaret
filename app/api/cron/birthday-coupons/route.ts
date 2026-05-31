import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBulkCoupons } from "@/lib/campaign/coupon-generator";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  // Aktif BIRTHDAY kampanyası var mı?
  const birthdayCampaign = await prisma.campaign.findFirst({
    where: { type: "BIRTHDAY", status: "ACTIVE" },
  });
  if (!birthdayCampaign) return NextResponse.json({ skipped: true, reason: "No active birthday campaign" });

  const now = new Date();
  const today = { month: now.getMonth() + 1, day: now.getDate() };

  // Bu ay doğum günü olan, bugün için zaten kupon atanmamış kullanıcılar
  // Not: User modelinde birthDate yok henüz — placeholder olarak kaydedilen customer campaign segmentine bakılır
  // Şimdilik: BIRTHDAY segmenti olan kampanyalar için CustomerCoupon üretimi
  const usersWithBirthday = await prisma.user.findMany({
    where: {
      isActive: true,
      // birthDate alanı geldiğinde buraya eklenecek
    },
    select: { id: true, email: true, name: true },
    take: 500,
  });

  let sent = 0;
  for (const user of usersWithBirthday) {
    const alreadyHas = await prisma.customerCoupon.findFirst({
      where: {
        userId: user.id,
        coupon: { campaignId: birthdayCampaign.id },
        assignedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });
    if (alreadyHas) continue;

    const { codes } = await generateBulkCoupons({
      count: 1,
      prefix: "DOGUM",
      campaignId: birthdayCampaign.id,
      discountType: "PERCENTAGE",
      discountValue: 15,
      perCustomerLimit: 1,
      expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    });

    if (codes[0]) {
      const coupon = await prisma.coupon.findUnique({ where: { code: codes[0] } });
      if (coupon) {
        await prisma.customerCoupon.create({
          data: { userId: user.id, couponId: coupon.id },
        });
        sent++;
      }
    }
  }

  return NextResponse.json({ sent, today });
}
