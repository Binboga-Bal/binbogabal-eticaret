import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RoleBadge } from "@/components/admin/rbac/RoleBadge";
import { UserStatusBadge } from "@/components/admin/rbac/UserStatusBadge";

export const dynamic = "force-dynamic";

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("roles", "view");
  const { id } = await params;

  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true }, orderBy: [{ permission: { module: "asc" } }] },
      users: { include: { user: { select: { id: true, name: true, email: true, status: true } } }, take: 20 },
      parent: true,
      children: true,
    },
  });

  if (!role) notFound();

  const moduleMap = role.permissions.reduce<Record<string, typeof role.permissions>>((acc, rp) => {
    const m = rp.permission.module;
    if (!acc[m]) acc[m] = [];
    acc[m].push(rp);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <RoleBadge name={role.name} color={role.color} />
            {role.isSystem && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Sistem Rolü</span>}
          </div>
          <p className="text-gray-500 mt-2 text-sm">{role.description ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/roles/${id}/permissions`}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold">
            İzinleri Düzenle
          </Link>
          <Link href="/admin/roles" className="text-sm text-gray-500 hover:underline ml-2">← Roller</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">İzinler ({role.permissions.length})</h2>
            {Object.entries(moduleMap).map(([module, perms]) => (
              <div key={module} className="mb-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-2">{module}</h3>
                <div className="flex flex-wrap gap-2">
                  {perms.map((rp) => (
                    <span key={rp.id}
                      className={`text-xs px-2 py-1 rounded-full font-mono ${rp.granted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 line-through"}`}>
                      {rp.permission.action}{rp.permission.scope ? `:${rp.permission.scope}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {role.permissions.length === 0 && <p className="text-sm text-gray-400">İzin tanımlanmamış</p>}
          </div>

          {/* Hierarchy */}
          {(role.parent || role.children.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Hiyerarşi</h2>
              {role.parent && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Üst rol: </span>
                  <Link href={`/admin/roles/${role.parent.id}`} className="text-amber-600 hover:underline text-sm">
                    {role.parent.name}
                  </Link>
                </div>
              )}
              {role.children.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Alt roller: </span>
                  {role.children.map((c) => (
                    <Link key={c.id} href={`/admin/roles/${c.id}`} className="text-amber-600 hover:underline text-sm mr-2">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Bu Roldeki Kullanıcılar ({role.users.length})</h2>
            {role.users.length === 0 ? (
              <p className="text-sm text-gray-400">Kullanıcı yok</p>
            ) : (
              <div className="space-y-3">
                {role.users.map((ur) => (
                  <div key={ur.userId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ur.user.name}</p>
                      <p className="text-xs text-gray-400">{ur.user.email}</p>
                    </div>
                    <UserStatusBadge status={ur.user.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {!role.isSystem && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <Link href={`/api/admin/roles/${id}/duplicate`}
                className="block w-full text-center py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Klonla
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
