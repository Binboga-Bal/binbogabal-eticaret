import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const CLEANUP_RULES = [
  { level: "DEBUG" as const, days: parseInt(process.env.LOG_CLEANUP_DEBUG_DAYS ?? "7") },
  { level: "INFO" as const, days: parseInt(process.env.LOG_CLEANUP_INFO_DAYS ?? "30") },
  { level: "WARNING" as const, days: parseInt(process.env.LOG_CLEANUP_WARNING_DAYS ?? "90") },
  // ERROR and CRITICAL are never auto-deleted
];

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  void createLog({
    level: "INFO",
    category: "CRON",
    action: LOG_ACTIONS.SYSTEM_CRON_STARTED,
    message: "Log temizleme cron görevi başladı",
  });

  let totalDeleted = 0;
  const results: Record<string, number> = {};

  for (const rule of CLEANUP_RULES) {
    const cutoff = new Date(Date.now() - rule.days * 24 * 60 * 60 * 1000);
    const result = await prisma.activityLog.deleteMany({
      where: { level: rule.level, createdAt: { lt: cutoff } },
    });
    results[rule.level] = result.count;
    totalDeleted += result.count;
  }

  const reportMsg = Object.entries(results)
    .map(([level, count]) => `${level}: ${count}`)
    .join(", ");

  // Telegram report
  if (process.env.TELEGRAM_DEFAULT_CHAT_ID && process.env.TELEGRAM_BOT_TOKEN && totalDeleted > 0) {
    fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_DEFAULT_CHAT_ID,
          text: `🗑 <b>Log Temizleme Raporu</b>\n\nToplam silinen: <b>${totalDeleted}</b>\n${reportMsg}`,
          parse_mode: "HTML",
        }),
      },
    ).catch(() => null);
  }

  void createLog({
    level: "INFO",
    category: "CRON",
    action: LOG_ACTIONS.SYSTEM_CRON_COMPLETED,
    message: `Log temizleme tamamlandı: ${totalDeleted} kayıt silindi (${reportMsg})`,
  });

  return NextResponse.json({ ok: true, totalDeleted, results });
}
