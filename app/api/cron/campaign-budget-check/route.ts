import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCampaignCache } from "@/lib/campaign/engine";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  // budgetUsed >= budgetLimit olan aktif kampanyaları duraklat
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      budgetLimit: { not: null },
    },
    select: { id: true, budgetUsed: true, budgetLimit: true },
  });

  const tooPaused = campaigns.filter(
    (c) => c.budgetLimit !== null && Number(c.budgetUsed) >= Number(c.budgetLimit)
  );

  if (tooPaused.length > 0) {
    await prisma.campaign.updateMany({
      where: { id: { in: tooPaused.map((c) => c.id) } },
      data: { status: "PAUSED" },
    });
    invalidateCampaignCache();
  }

  return NextResponse.json({ paused: tooPaused.length });
}
