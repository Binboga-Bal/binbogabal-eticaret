import ipRangeCheck from "ip-range-check";
import { prisma } from "@/lib/prisma";

export async function isIPAllowed(ipAddress: string, adminId: string): Promise<boolean> {
  // Global rules (userId: null)
  const globalRules = await prisma.adminAllowedIP.findMany({
    where: { userId: null },
    select: { ipRange: true },
  });

  // User-specific rules
  const userRules = await prisma.adminAllowedIP.findMany({
    where: { userId: adminId },
    select: { ipRange: true },
  });

  const allRules = [...globalRules, ...userRules];

  // No rules = no restriction
  if (allRules.length === 0) return true;

  return allRules.some((rule) => {
    try {
      return ipRangeCheck(ipAddress, rule.ipRange);
    } catch {
      return false;
    }
  });
}

export function isWithinAllowedHours(
  allowedStart: string | null,
  allowedEnd: string | null,
  allowedDays: number[]
): boolean {
  if (!allowedStart || !allowedEnd) return true;

  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  if (allowedDays.length > 0 && !allowedDays.includes(day)) return false;

  const [startH, startM] = allowedStart.split(":").map(Number);
  const [endH, endM] = allowedEnd.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function isSuspiciousLogin(
  lastCountry: string | null,
  currentCountry: string | null,
  lastLoginAt: Date | null
): boolean {
  // Different country from last login
  if (lastCountry && currentCountry && lastCountry !== currentCountry) return true;

  // Night time login (00:00–06:00)
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return true;

  return false;
}
