import { type ActivityLog, type AuditLog } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTelegramConfigs, configMatchesActivityLog, configMatchesAuditLog } from "./cache";

// In-memory rate limit: action+ip → last sent timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000;

const LEVEL_EMOJI: Record<string, string> = {
  CRITICAL: "🔴",
  ERROR: "🟠",
  WARNING: "🟡",
  INFO: "🔵",
  DEBUG: "⚪",
};

function formatTelegramMessage(log: ActivityLog, appUrl: string): string {
  const emoji = LEVEL_EMOJI[log.level] ?? "⚪";
  const date = new Date(log.createdAt).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lines = [
    `${emoji} <b>${log.level}</b> | ${log.category}`,
    "",
    `🎯 <b>Aksiyon:</b> ${log.action}`,
  ];

  if (log.actorEmail) lines.push(`👤 <b>Aktör:</b> ${log.actorEmail}${log.actorRole ? ` (${log.actorRole})` : ""}`);
  if (log.actorIp) lines.push(`🌐 <b>IP:</b> ${log.actorIp}`);
  if (log.path) lines.push(`📍 <b>Path:</b> ${log.method ?? ""} ${log.path}`);
  if (log.targetLabel) lines.push(`🎯 <b>Hedef:</b> ${log.targetLabel}`);

  lines.push(`💬 ${log.message}`);
  lines.push("");
  lines.push(`🕐 ${date}`);
  lines.push(`🔗 ${appUrl}/admin/logs?id=${log.id}`);

  return lines.join("\n");
}

async function sendToChat(chatId: string, text: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { result?: { message_id?: number } };
    return data.result?.message_id?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function sendTelegramAlert(log: ActivityLog): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || process.env.LOG_TELEGRAM_ENABLED === "false") return;

  const rateLimitKey = `${log.action}::${log.actorIp ?? ""}`;
  const lastSent = rateLimitMap.get(rateLimitKey) ?? 0;
  if (Date.now() - lastSent < RATE_LIMIT_MS) return;
  rateLimitMap.set(rateLimitKey, Date.now());

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const configs = await getTelegramConfigs();
    const matchingConfigs = configs.filter((c) => configMatchesActivityLog(c, log.level, log.category));

    if (matchingConfigs.length === 0 && process.env.TELEGRAM_DEFAULT_CHAT_ID) {
      const msgId = await sendToChat(
        process.env.TELEGRAM_DEFAULT_CHAT_ID,
        formatTelegramMessage(log, appUrl),
        token,
      );
      if (msgId) {
        await prisma.activityLog.update({
          where: { id: log.id },
          data: { telegramSent: true, telegramMsgId: msgId },
        }).catch(() => null);
      }
      return;
    }

    const message = formatTelegramMessage(log, appUrl);
    let firstMsgId: string | null = null;

    for (const config of matchingConfigs) {
      const msgId = await sendToChat(config.chatId, message, token);
      if (msgId && !firstMsgId) firstMsgId = msgId;
    }

    if (firstMsgId) {
      await prisma.activityLog.update({
        where: { id: log.id },
        data: { telegramSent: true, telegramMsgId: firstMsgId },
      }).catch(() => null);
    }
  } catch (err) {
    console.error("[telegram] alert gönderilemedi:", err);
  }
}

function formatAuditTelegramMessage(log: AuditLog, appUrl: string): string {
  const date = new Date(log.createdAt).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const riskEmoji = log.riskScore >= 60 ? "🔴" : log.riskScore >= 30 ? "🟠" : "🟡";

  const lines = [
    `${riskEmoji} <b>AUDIT</b> | ${log.module}`,
    "",
    `🎯 <b>Aksiyon:</b> ${log.action}`,
  ];

  if (log.adminName) lines.push(`👤 <b>Admin:</b> ${log.adminName}`);
  if (log.ipAddress) lines.push(`🌐 <b>IP:</b> ${log.ipAddress}`);
  if (log.targetLabel) lines.push(`🎯 <b>Hedef:</b> ${log.targetLabel}`);
  lines.push(`⚠️ <b>Risk Skoru:</b> ${log.riskScore}/100`);
  lines.push("");
  lines.push(`🕐 ${date}`);
  lines.push(`🔗 ${appUrl}/admin/audit-log`);

  return lines.join("\n");
}

export async function sendAuditTelegramAlert(log: AuditLog): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || process.env.LOG_TELEGRAM_ENABLED === "false") return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const configs = await getTelegramConfigs();
    const matchingConfigs = configs.filter((c) => configMatchesAuditLog(c, log.module, log.riskScore));

    if (matchingConfigs.length === 0 && process.env.TELEGRAM_DEFAULT_CHAT_ID) {
      await sendToChat(process.env.TELEGRAM_DEFAULT_CHAT_ID, formatAuditTelegramMessage(log, appUrl), token);
      return;
    }

    const message = formatAuditTelegramMessage(log, appUrl);
    for (const config of matchingConfigs) {
      await sendToChat(config.chatId, message, token);
    }
  } catch (err) {
    console.error("[telegram] audit alert gönderilemedi:", err);
  }
}

export async function sendTelegramTestMessage(chatId: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const text = `✅ <b>Test Mesajı</b>\n\nBu, ${appUrl} için Telegram alert konfigürasyonunun doğrulama mesajıdır.\n\n🕐 ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`;
  const result = await sendToChat(chatId, text, token);
  return result !== null;
}
