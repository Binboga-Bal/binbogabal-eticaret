import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { type LogLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const period = req.nextUrl.searchParams.get("period") ?? "7d";
  const days = period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalLogs, byLevel, byCategory, topActions, topIps, recentCritical] = await Promise.all([
    prisma.activityLog.count({ where: { createdAt: { gte: since } } }),
    prisma.activityLog.groupBy({
      by: ["level"],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.activityLog.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { category: "desc" } },
      take: 20,
    }),
    prisma.activityLog.groupBy({
      by: ["action"],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
    prisma.activityLog.groupBy({
      by: ["actorIp"],
      _count: { _all: true },
      where: { createdAt: { gte: since }, actorIp: { not: null } },
      orderBy: { _count: { actorIp: "desc" } },
      take: 10,
    }),
    prisma.activityLog.findMany({
      where: { level: "CRITICAL", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Build daily timeline
  const timeline: Array<{ date: string; total: number; errors: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const [total, errors] = await Promise.all([
      prisma.activityLog.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } }),
      prisma.activityLog.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd }, level: { in: ["ERROR", "CRITICAL"] } },
      }),
    ]);

    timeline.push({
      date: dayStart.toISOString().split("T")[0],
      total,
      errors,
    });
  }

  const byLevelMap = Object.fromEntries(
    byLevel.map((b) => [b.level, b._count._all])
  ) as Record<LogLevel, number>;

  const errorCount = (byLevelMap["ERROR"] ?? 0) + (byLevelMap["CRITICAL"] ?? 0);
  const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;

  return NextResponse.json({
    totalLogs,
    byLevel: byLevelMap,
    byCategory: Object.fromEntries(byCategory.map((b) => [b.category, b._count._all])),
    topActions: topActions.map((a) => ({ action: a.action, count: a._count._all })),
    topIps: topIps.map((ip) => ({ ip: ip.actorIp, count: ip._count._all })),
    errorRate: parseFloat(errorRate.toFixed(2)),
    timeline,
    recentCritical,
  });
}
