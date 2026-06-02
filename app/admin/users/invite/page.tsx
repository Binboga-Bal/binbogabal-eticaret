import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { InviteUserForm } from "@/components/admin/rbac/InviteUserForm";

export const dynamic = "force-dynamic";

export default async function InviteUserPage() {
  await requirePermission("admin_users", "create");

  const roles = await prisma.adminRole.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kullanıcı Davet Et</h1>
      <InviteUserForm roles={roles} />
    </div>
  );
}
