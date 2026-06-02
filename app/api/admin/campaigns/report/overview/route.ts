import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "campaigns", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

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
