import { prisma } from "@/lib/prisma";
import { sendAuditTelegramAlert } from "@/lib/logger/telegram";
import { sanitizeDetail } from "@/lib/logger/sanitize";

interface LogActionParams {
  adminId?: string;
  adminName?: string;
  action: string;
  module: string;
  targetId?: string;
  targetLabel?: string;
  previousData?: unknown;
  newData?: unknown;
  req?: Request | { headers: { get(name: string): string | null } };
}

function calculateRiskScore(params: LogActionParams): number {
  let score = 0;
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) score += 20;
  if (params.action === "delete" || params.action.includes("delete")) score += 30;
  if (params.module === "admin_users" || params.module === "roles" || params.module === "settings") score += 25;
  if (params.module === "coupons" || params.module === "volume_discounts") score += 15;
  if (params.action === "bulk_generate" || params.action.includes("bulk")) score += 20;
  if (params.action === "account_locked" || params.action === "login_failed") score += 15;

  return Math.min(score, 100);
}

function getClientIP(req?: LogActionParams["req"]): string | null {
  if (!req) return null;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    const riskScore = calculateRiskScore(params);
    const ip = getClientIP(params.req);
    const ua = params.req?.headers.get("user-agent") ?? null;

    const log = await prisma.auditLog.create({
      data: {
        adminId: params.adminId ?? null,
        adminName: params.adminName ?? null,
        action: params.action,
        module: params.module,
        targetId: params.targetId ?? null,
        targetLabel: params.targetLabel ?? null,
        previousData: params.previousData ? (sanitizeDetail(params.previousData) as object) : undefined,
        newData: params.newData ? (sanitizeDetail(params.newData) as object) : undefined,
        ipAddress: ip,
        userAgent: ua,
        riskScore,
      },
    });

    sendAuditTelegramAlert(log).catch((err) => console.error("[audit] telegram hata:", err));
  } catch (err) {
    // Audit log failure must never crash the main flow
    console.error("[AuditLog] Failed to log action:", err);
  }
}
