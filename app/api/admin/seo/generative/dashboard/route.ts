import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalMentions,
    mentionedCount,
    botAccessByBot,
    topMentionedUrls,
    recentMentions,
    avgLlmScore,
    lowLlmScoreCount,
  ] = await Promise.all([
    prisma.llmMention.count(),
    prisma.llmMention.count({ where: { mentioned: true } }),
    prisma.llmBotAccess.groupBy({
      by: ["botName"],
      _count: true,
      where: { accessedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { botName: "desc" } },
    }),
    prisma.llmMention.groupBy({
      by: ["mentionUrl"],
      _count: true,
      where: { mentioned: true, mentionUrl: { not: null } },
      orderBy: { _count: { mentionUrl: "desc" } },
      take: 5,
    }),
    prisma.llmMention.findMany({
      orderBy: { recordedAt: "desc" },
      take: 10,
    }),
    prisma.seoMeta.aggregate({ _avg: { llmScore: true } }),
    prisma.seoMeta.count({ where: { llmScore: { lt: 41 } } }),
  ]);

  return NextResponse.json({
    mentions: { total: totalMentions, mentioned: mentionedCount },
    botAccess: botAccessByBot.map((b) => ({ bot: b.botName, count: b._count })),
    topUrls: topMentionedUrls.map((u) => ({ url: u.mentionUrl, count: u._count })),
    recentMentions,
    llmScoreAvg: avgLlmScore._avg.llmScore ?? 0,
    lowLlmScoreCount,
  });
}
