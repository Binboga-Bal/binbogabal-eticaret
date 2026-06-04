import { type TelegramAlertConfig, type LogLevel, type LogCategory } from "@prisma/client";

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

  // Lazy import to avoid circular deps
  const { prisma } = await import("@/lib/prisma");
  const configs = await prisma.telegramAlertConfig.findMany({
    where: { isActive: true },
  });

  cache = { configs, expiresAt: Date.now() + TTL_MS };
  return configs;
}

export function invalidateTelegramCache(): void {
  cache = null;
}

export function configMatchesLog(
  config: TelegramAlertConfig,
  level: LogLevel,
  category: LogCategory,
): boolean {
  if (!config.levels.includes(level)) return false;
  if (config.categories.length > 0 && !config.categories.includes(category)) return false;
  return true;
}
