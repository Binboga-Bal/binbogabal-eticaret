import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCampaignCache } from "@/lib/campaign/engine";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();

  // APPROVED + startsAt geçmiş → ACTIVE
  const result = await prisma.campaign.updateMany({
    where: {
      status: "APPROVED",
      startsAt: { lte: now },
      requiresApproval: false,
    },
    data: { status: "ACTIVE" },
  });

  // DRAFT/APPROVED + startsAt geçmiş ama requiresApproval=false → ACTIVE
  const result2 = await prisma.campaign.updateMany({
    where: {
      status: "DRAFT",
      requiresApproval: false,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
    data: { status: "ACTIVE" },
  });

  if (result.count > 0 || result2.count > 0) {
    invalidateCampaignCache();
  }

  return NextResponse.json({ activated: result.count + result2.count });
}
