import { type LogLevel, type LogCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeDetail } from "./sanitize";
import { sendTelegramAlert } from "./telegram";

const MIN_LEVEL_ORDER: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4,
};

function getConfiguredMinLevel(): LogLevel {
  const env = process.env.LOG_MIN_LEVEL as LogLevel | undefined;
  if (env && env in MIN_LEVEL_ORDER) return env;
  return "INFO";
}

export interface CreateLogParams {
  level?: LogLevel;
  category: LogCategory;
  action: string;
  message: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  actorIp?: string;
  userAgent?: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  detail?: Record<string, unknown>;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
}

export async function createLog(params: CreateLogParams): Promise<void> {
  try {
    const level: LogLevel = params.level ?? "INFO";
    const minLevel = getConfiguredMinLevel();

    const skipPaths = (process.env.LOG_SKIP_PATHS ?? "/api/health,/api/metrics,/_next").split(",");
    if (params.path && skipPaths.some((p) => params.path!.startsWith(p.trim()))) return;

    if (MIN_LEVEL_ORDER[level] < MIN_LEVEL_ORDER[minLevel]) return;

    const sanitized = params.detail ? sanitizeDetail(params.detail) : null;

    const log = await prisma.activityLog.create({
      data: {
        level,
        category: params.category,
        action: params.action,
        message: params.message,
        actorId: params.actorId ?? null,
        actorRole: params.actorRole ?? null,
        actorEmail: params.actorEmail ?? null,
        actorIp: params.actorIp ?? null,
        userAgent: params.userAgent ?? null,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        targetLabel: params.targetLabel ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detail: sanitized as any,
        method: params.method ?? null,
        path: params.path ?? null,
        statusCode: params.statusCode ?? null,
        duration: params.duration ?? null,
      },
    });

    if (MIN_LEVEL_ORDER[level] >= MIN_LEVEL_ORDER["WARNING"]) {
      sendTelegramAlert(log).catch((err) => console.error("[logger] telegram hata:", err));
    }
  } catch (err) {
    console.error("[logger] log yazılamadı:", err);
  }
}
