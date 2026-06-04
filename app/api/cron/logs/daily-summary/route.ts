import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";
import { sendTelegramTestMessage } from "@/lib/logger/telegram";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  void createLog({
    level: "INFO",
    category: "CRON",
    action: LOG_ACTIONS.SYSTEM_CRON_STARTED,
    message: "Günlük log özeti cron görevi başladı",
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const todayStart = new Date(yesterday);
  todayStart.setDate(todayStart.getDate() + 1);

  const [byLevel, byCategory, byAction, uniqueIps, uniqueUsers] = await Promise.all([
    prisma.activityLog.groupBy({
      by: ["level"],
      _count: { _all: true },
      where: { createdAt: { gte: yesterday, lt: todayStart } },
    }),
    prisma.activityLog.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { createdAt: { gte: yesterday, lt: todayStart } },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    prisma.activityLog.groupBy({
      by: ["action"],
      _count: { _all: true },
      where: { createdAt: { gte: yesterday, lt: todayStart } },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
    prisma.activityLog.findMany({
      where: { createdAt: { gte: yesterday, lt: todayStart }, actorIp: { not: null } },
      select: { actorIp: true },
      distinct: ["actorIp"],
    }),
    prisma.activityLog.findMany({
      where: { createdAt: { gte: yesterday, lt: todayStart }, actorId: { not: null } },
      select: { actorId: true },
      distinct: ["actorId"],
    }),
  ]);

  const levelMap = Object.fromEntries(byLevel.map((b) => [b.level, b._count._all]));
  const total = Object.values(levelMap).reduce((a, b) => a + b, 0);
  const criticalCount = levelMap["CRITICAL"] ?? 0;
  const errorCount = levelMap["ERROR"] ?? 0;
  const warningCount = levelMap["WARNING"] ?? 0;

  await prisma.logSummary.upsert({
    where: { date: yesterday },
    create: {
      date: yesterday,
      totalLogs: total,
      debugCount: levelMap["DEBUG"] ?? 0,
      infoCount: levelMap["INFO"] ?? 0,
      warningCount,
      errorCount,
      criticalCount,
      topCategories: byCategory.map((b) => ({ category: b.category, count: b._count._all })),
      topActions: byAction.map((b) => ({ action: b.action, count: b._count._all })),
      uniqueIps: uniqueIps.length,
      uniqueUsers: uniqueUsers.length,
    },
    update: {
      totalLogs: total,
      debugCount: levelMap["DEBUG"] ?? 0,
      infoCount: levelMap["INFO"] ?? 0,
      warningCount,
      errorCount,
      criticalCount,
      topCategories: byCategory.map((b) => ({ category: b.category, count: b._count._all })),
      topActions: byAction.map((b) => ({ action: b.action, count: b._count._all })),
      uniqueIps: uniqueIps.length,
      uniqueUsers: uniqueUsers.length,
    },
  });

  // Send Telegram summary if there are critical logs
  if (criticalCount > 0 && process.env.TELEGRAM_DEFAULT_CHAT_ID && process.env.TELEGRAM_BOT_TOKEN) {
    const dateStr = yesterday.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const summaryMsg = `📊 <b>Günlük Log Özeti - ${dateStr}</b>\n├ Toplam: ${total.toLocaleString("tr-TR")} log\n├ 🔴 Kritik: ${criticalCount}\n├ 🟠 Hata: ${errorCount}\n└ 🟡 Uyarı: ${warningCount}`;

    fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_DEFAULT_CHAT_ID,
          text: summaryMsg,
          parse_mode: "HTML",
        }),
      },
    ).catch(() => null);
  }

  void createLog({
    level: "INFO",
    category: "CRON",
    action: LOG_ACTIONS.SYSTEM_CRON_COMPLETED,
    message: `Günlük log özeti tamamlandı: ${total} log, ${criticalCount} kritik`,
  });

  return NextResponse.json({ ok: true, total, criticalCount, errorCount, warningCount });
}
