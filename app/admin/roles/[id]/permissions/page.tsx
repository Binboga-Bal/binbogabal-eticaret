import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RolePermissionsEditor } from "@/components/admin/rbac/RolePermissionsEditor";

export const dynamic = "force-dynamic";

export default async function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("roles", "update");
  const { id } = await params;

  const [role, allPermissions, rolePerms] = await Promise.all([
    prisma.adminRole.findUnique({ where: { id } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.adminRolePermission.findMany({ where: { roleId: id } }),
  ]);

  if (!role) notFound();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{role.name} — İzinler</h1>
      <p className="text-sm text-gray-500 mb-6">Bu rol için izinleri düzenleyin.</p>
      <RolePermissionsEditor roleId={id} roleName={role.name} permissions={allPermissions} rolePerms={rolePerms} />
    </div>
  );
}
