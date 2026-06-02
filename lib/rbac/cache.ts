import type { ResolvedPermissions } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

interface CacheEntry {
  permissions: ResolvedPermissions;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedPermissions(adminId: string): ResolvedPermissions | null {
  const entry = cache.get(adminId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(adminId);
    return null;
  }
  return entry.permissions;
}

export function setCachedPermissions(adminId: string, permissions: ResolvedPermissions): void {
  cache.set(adminId, { permissions, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidatePermissionCache(adminId: string): void {
  cache.delete(adminId);
}

export function invalidateAllPermissionCaches(): void {
  cache.clear();
}
