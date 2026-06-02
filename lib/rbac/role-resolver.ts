import { prisma } from "@/lib/prisma";
import { getCachedPermissions, setCachedPermissions } from "./cache";
import type { ResolvedPermissions } from "./types";

function permKey(module: string, action: string, scope?: string | null): string {
  return `${module}:${action}:${scope || ""}`;
}

function fieldKey(module: string, fieldGroup: string): string {
  return `${module}:${fieldGroup}`;
}

async function collectRoleIds(roleId: string, visited = new Set<string>()): Promise<string[]> {
  if (visited.has(roleId)) return [];
  visited.add(roleId);
  const role = await prisma.adminRole.findUnique({
    where: { id: roleId },
    select: { id: true, parentId: true },
  });
  if (!role) return [roleId];
  const ids = [roleId];
  if (role.parentId) {
    const parentIds = await collectRoleIds(role.parentId, visited);
    ids.push(...parentIds);
  }
  return ids;
}

export async function resolvePermissions(adminId: string): Promise<ResolvedPermissions> {
  const cached = getCachedPermissions(adminId);
  if (cached) return cached;

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      isSuperAdmin: true,
      roles: {
        select: { roleId: true },
      },
    },
  });

  if (!admin) {
    return { adminId, isSuperAdmin: false, grants: new Set(), denies: new Set(), fieldGroups: new Set() };
  }

  if (admin.isSuperAdmin) {
    const result: ResolvedPermissions = {
      adminId,
      isSuperAdmin: true,
      grants: new Set(["*"]),
      denies: new Set(),
      fieldGroups: new Set(["*"]),
    };
    setCachedPermissions(adminId, result);
    return result;
  }

  // Collect all role IDs including parents (hierarchy)
  const allRoleIds = new Set<string>();
  for (const { roleId } of admin.roles) {
    const ids = await collectRoleIds(roleId);
    ids.forEach((id) => allRoleIds.add(id));
  }

  // Fetch all permissions for these roles
  const rolePerms = await prisma.adminRolePermission.findMany({
    where: { roleId: { in: [...allRoleIds] } },
    include: { permission: true },
  });

  // Check temporary permissions (active & not expired)
  const tempPerms = await prisma.temporaryPermission.findMany({
    where: {
      userId: adminId,
      isActive: true,
      validUntil: { gt: new Date() },
      validFrom: { lte: new Date() },
    },
    include: { permission: true },
  });

  const grants = new Set<string>();
  const denies = new Set<string>();
  const fieldGroups = new Set<string>();

  // Role permissions — denies have priority
  for (const rp of rolePerms) {
    const key = permKey(rp.permission.module, rp.permission.action, rp.permission.scope);
    if (rp.granted) {
      grants.add(key);
      if (rp.permission.fieldGroup) {
        fieldGroups.add(fieldKey(rp.permission.module, rp.permission.fieldGroup));
      }
    } else {
      denies.add(key);
    }
  }

  // Temporary permissions always grant
  for (const tp of tempPerms) {
    const key = permKey(tp.permission.module, tp.permission.action, tp.permission.scope);
    grants.add(key);
    if (tp.permission.fieldGroup) {
      fieldGroups.add(fieldKey(tp.permission.module, tp.permission.fieldGroup));
    }
  }

  const result: ResolvedPermissions = { adminId, isSuperAdmin: false, grants, denies, fieldGroups };
  setCachedPermissions(adminId, result);
  return result;
}
