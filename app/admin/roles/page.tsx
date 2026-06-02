import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RoleBadge } from "@/components/admin/rbac/RoleBadge";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await requirePermission("roles", "view");

  const roles = await prisma.adminRole.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, permissions: true } },
      parent: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roller</h1>
          <p className="text-sm text-gray-500 mt-1">{roles.length} rol tanımlı</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/permissions/matrix"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            İzin Matrisi
          </Link>
          <Link href="/admin/roles/new"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition">
            + Yeni Rol
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-3">
              <RoleBadge name={role.name} color={role.color} />
              <div className="flex gap-1">
                {role.isSystem && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Sistem</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{role.description ?? "—"}</p>
            {role.parent && (
              <p className="text-xs text-gray-400 mb-2">Üst rol: {role.parent.name}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span>{role._count.users} kullanıcı</span>
              <span>{role._count.permissions} izin</span>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/roles/${role.id}`}
                className="flex-1 text-center py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Detay
              </Link>
              <Link href={`/admin/roles/${role.id}/permissions`}
                className="flex-1 text-center py-1.5 text-xs font-medium border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition">
                İzinler
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
