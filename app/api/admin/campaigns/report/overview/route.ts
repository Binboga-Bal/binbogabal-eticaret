import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [totalCampaigns, activeCampaigns, totalUsages, totalDiscount] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaignUsage.count(),
    prisma.campaignUsage.aggregate({ _sum: { discountAmount: true } }),
  ]);

  const topCampaigns = await prisma.campaign.findMany({
    orderBy: { usages: { _count: "desc" } },
    take: 5,
    include: { _count: { select: { usages: true } } },
  });

  return NextResponse.json({
    totalCampaigns,
    activeCampaigns,
    totalUsages,
    totalDiscount: Number(totalDiscount._sum.discountAmount ?? 0),
    topCampaigns,
  });
}
