import { resolvePermissions } from "./role-resolver";
import type { PermissionCheck } from "./types";

function permKey(module: string, action: string, scope?: string | null): string {
  return `${module}:${action}:${scope ?? ""}`;
}

export async function can(adminId: string, module: string, action: string, scope?: string): Promise<boolean> {
  const resolved = await resolvePermissions(adminId);
  if (resolved.isSuperAdmin) return true;
  const key = permKey(module, action, scope);
  if (resolved.denies.has(key)) return false;
  return resolved.grants.has(key);
}

export async function canAccessField(adminId: string, module: string, fieldGroup: string): Promise<boolean> {
  const resolved = await resolvePermissions(adminId);
  if (resolved.isSuperAdmin) return true;
  return resolved.fieldGroups.has(`${module}:${fieldGroup}`);
}

export async function canAccessScope(adminId: string, scopeType: string, scopeId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const resolved = await resolvePermissions(adminId);
  if (resolved.isSuperAdmin) return true;
  const assignment = await prisma.scopeAssignment.findUnique({
    where: { userId_scopeType_scopeId: { userId: adminId, scopeType, scopeId } },
  });
  return !!assignment;
}

export async function canAll(adminId: string, checks: PermissionCheck[]): Promise<boolean> {
  for (const check of checks) {
    if (!(await can(adminId, check.module, check.action, check.scope))) return false;
  }
  return true;
}

export async function canAny(adminId: string, checks: PermissionCheck[]): Promise<boolean> {
  for (const check of checks) {
    if (await can(adminId, check.module, check.action, check.scope)) return true;
  }
  return false;
}
