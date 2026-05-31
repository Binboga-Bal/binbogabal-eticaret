import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  // ABANDONED_CART tipi kampanya var mı?
  const campaign = await prisma.campaign.findFirst({
    where: { type: "ABANDONED_CART", status: "ACTIVE" },
  });
  if (!campaign) return NextResponse.json({ skipped: true, reason: "No active abandoned cart campaign" });

  // Terk edilmiş sepet verisi şu an session store'da (Zustand), DB'de tutulmuyor.
  // Bu cron, sepet verisi DB'ye kaydedildiğinde aktive edilecek.
  // Şimdilik 2 saat önce PENDING kalan siparişleri işarete et.
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: { lte: twoHoursAgo },
      userId: { not: null },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    take: 100,
  });

  // Bildirim gönderimi mail servisine devredilir (placeholder)
  return NextResponse.json({
    candidates: pendingOrders.length,
    campaignId: campaign.id,
  });
}
