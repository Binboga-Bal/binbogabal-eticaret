import { type TelegramAlertConfig, type LogLevel, type LogCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface CacheEntry {
  configs: TelegramAlertConfig[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function getTelegramConfigs(): Promise<TelegramAlertConfig[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.configs;
  }

  const configs = await prisma.telegramAlertConfig.findMany({
    where: { isActive: true },
  });

  cache = { configs, expiresAt: Date.now() + TTL_MS };
  return configs;
}

export function invalidateTelegramCache(): void {
  cache = null;
}

export function configMatchesActivityLog(
  config: TelegramAlertConfig,
  level: LogLevel,
  category: LogCategory,
): boolean {
  if (config.logSource === "AUDIT") return false;
  if (!config.levels.includes(level)) return false;
  if (config.categories.length > 0 && !config.categories.includes(category)) return false;
  return true;
}

export function configMatchesAuditLog(
  config: TelegramAlertConfig,
  module: string,
  riskScore: number,
): boolean {
  if (config.logSource === "ACTIVITY") return false;
  if (riskScore < config.minRiskScore) return false;
  if (config.auditModules.length > 0 && !config.auditModules.includes(module)) return false;
  return true;
}

/** @deprecated use configMatchesActivityLog */
export function configMatchesLog(
  config: TelegramAlertConfig,
  level: LogLevel,
  category: LogCategory,
): boolean {
  return configMatchesActivityLog(config, level, category);
}
