import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCampaignCache } from "@/lib/campaign/engine";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();

  const result = await prisma.campaign.updateMany({
    where: {
      status: { in: ["ACTIVE", "APPROVED"] },
      endsAt: { lt: now },
    },
    data: { status: "ENDED" },
  });

  if (result.count > 0) invalidateCampaignCache();

  return NextResponse.json({ ended: result.count });
}
