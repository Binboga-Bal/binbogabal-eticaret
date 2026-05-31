import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBulkCoupons } from "@/lib/campaign/coupon-generator";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const winBackCampaign = await prisma.campaign.findFirst({
    where: { type: "WIN_BACK", status: "ACTIVE" },
  });
  if (!winBackCampaign) return NextResponse.json({ skipped: true, reason: "No active win-back campaign" });

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // 90+ gün sipariş vermeyen, daha önce en az 1 sipariş vermiş kullanıcılar
  const inactiveUsers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      isActive: true,
      orders: {
        some: { createdAt: { lt: cutoff } },
        none: { createdAt: { gte: cutoff } },
      },
    },
    select: { id: true, email: true, name: true },
    take: 200,
  });

  let sent = 0;
  for (const user of inactiveUsers) {
    // Bu ay zaten gönderilmiş mi?
    const now = new Date();
    const alreadyHas = await prisma.customerCoupon.findFirst({
      where: {
        userId: user.id,
        coupon: { campaignId: winBackCampaign.id },
        assignedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    });
    if (alreadyHas) continue;

    const { codes } = await generateBulkCoupons({
      count: 1,
      prefix: "GERI",
      campaignId: winBackCampaign.id,
      discountType: "PERCENTAGE",
      discountValue: 10,
      perCustomerLimit: 1,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

  return NextResponse.json({ sent, eligible: inactiveUsers.length });
}
