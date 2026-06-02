import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { NewRoleForm } from "@/components/admin/rbac/NewRoleForm";

export const dynamic = "force-dynamic";

export default async function NewRolePage() {
  await requirePermission("roles", "create");

  const roles = await prisma.adminRole.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Rol Oluştur</h1>
      <NewRoleForm parentRoles={roles} />
    </div>
  );
}
