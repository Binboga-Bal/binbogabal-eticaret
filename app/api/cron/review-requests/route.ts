import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/mail/mail.service";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const orders = await prisma.order.findMany({
    where: { status: "DELIVERED", reviewRequested: false, userId: { not: null } },
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { where: { reviewed: false } },
    },
  });

  let sent = 0;
  for (const order of orders) {
    if (!order.user || order.items.length === 0) continue;

    const reviewItems = order.items.map((item) => ({
      productName: item.productName,
      variantInfo: item.variantInfo,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hesabim/yorumlarim/bekleyenler`,
      imageUrl: item.image ?? undefined,
    }));

    await sendReviewRequestEmail(
      order.user.id,
      order.user.email,
      order.user.name ?? "Müşterimiz",
      order.orderNumber,
      reviewItems,
    ).catch(() => null);

    await prisma.order.update({ where: { id: order.id }, data: { reviewRequested: true } });
    sent++;
  }

  return NextResponse.json({ sent });
}
