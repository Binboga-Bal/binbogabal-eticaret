import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const [
    totalMeta,
    highSeoScore,
    mediumSeoScore,
    lowSeoScore,
    noIndex,
    highLlmScore,
    mediumLlmScore,
    lowLlmScore,
    totalKeywords,
    totalRedirects,
    totalBotAccess,
    recentBotAccess,
  ] = await Promise.all([
    prisma.seoMeta.count(),
    prisma.seoMeta.count({ where: { seoScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { seoScore: { gte: 41, lt: 71 } } }),
    prisma.seoMeta.count({ where: { seoScore: { lt: 41 } } }),
    prisma.seoMeta.count({ where: { noIndex: true } }),
    prisma.seoMeta.count({ where: { llmScore: { gte: 71 } } }),
    prisma.seoMeta.count({ where: { llmScore: { gte: 41, lt: 71 } } }),
    prisma.seoMeta.count({ where: { llmScore: { lt: 41 } } }),
    prisma.keywordTracking.count({ where: { isActive: true } }),
    prisma.redirect.count({ where: { isActive: true } }),
    prisma.llmBotAccess.count(),
    prisma.llmBotAccess.groupBy({
      by: ["botName"],
      _count: true,
      where: { accessedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { _count: { accessedAt: "desc" } },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    seo: {
      total: totalMeta,
      high: highSeoScore,
      medium: mediumSeoScore,
      low: lowSeoScore,
      noIndex,
    },
    generative: {
      high: highLlmScore,
      medium: mediumLlmScore,
      low: lowLlmScore,
    },
    keywords: totalKeywords,
    redirects: totalRedirects,
    llmBots: {
      total: totalBotAccess,
      byBot: recentBotAccess.map((b) => ({ bot: b.botName, count: b._count })),
    },
  });
}
