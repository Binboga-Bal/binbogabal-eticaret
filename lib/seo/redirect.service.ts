import { prisma } from "@/lib/prisma";

// Bellek içi cache — production'da Redis ile değiştirilebilir
const cache = new Map<string, { toPath: string; statusCode: number; id: string } | null>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika
const cacheTimestamps = new Map<string, number>();

export async function findRedirect(fromPath: string) {
  const now = Date.now();
  const cached = cache.get(fromPath);
  const ts = cacheTimestamps.get(fromPath);

  if (cached !== undefined && ts && now - ts < CACHE_TTL_MS) {
    return cached;
  }

  const redirect = await prisma.redirect
    .findUnique({
      where: { fromPath, isActive: true },
      select: { id: true, toPath: true, statusCode: true },
    })
    .catch(() => null);

  cache.set(fromPath, redirect ?? null);
  cacheTimestamps.set(fromPath, now);
  return redirect ?? null;
}

export async function incrementHitCount(id: string) {
  await prisma.redirect
    .update({ where: { id }, data: { hitCount: { increment: 1 } } })
    .catch(() => null);
}

export function clearRedirectCache() {
  cache.clear();
  cacheTimestamps.clear();
}
