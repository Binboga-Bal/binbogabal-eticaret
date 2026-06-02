import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PermissionMatrix } from "@/components/admin/rbac/PermissionMatrix";

export const dynamic = "force-dynamic";

export default async function PermissionMatrixPage() {
  await requirePermission("roles", "view");

  const [roles, permissions, rolePermissions] = await Promise.all([
    prisma.adminRole.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.adminRolePermission.findMany(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İzin Matrisi</h1>
          <p className="text-sm text-gray-500 mt-1">Rol × İzin — tablo üzerinden düzenle</p>
        </div>
      </div>
      <PermissionMatrix roles={roles} permissions={permissions} rolePermissions={rolePermissions} />
    </div>
  );
}
