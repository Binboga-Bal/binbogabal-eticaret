import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserStatusBadge } from "@/components/admin/rbac/UserStatusBadge";
import { RoleBadge } from "@/components/admin/rbac/RoleBadge";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requirePermission("admin_users", "view");

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const limit = 20;
  const search = sp.search;
  const status = sp.status as string | undefined;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.adminUser.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { roles: { include: { role: { select: { name: true, slug: true, color: true } } } } },
    }),
    prisma.adminUser.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Kullanıcılar</h1>
          <p className="text-sm text-gray-500 mt-1">{total} kullanıcı</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/users/import"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            CSV Import
          </Link>
          <Link
            href="/admin/users/invite"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition"
          >
            + Kullanıcı Davet Et
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-4 flex-wrap">
        <form className="flex gap-4 flex-1 flex-wrap">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="İsim veya email ara..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Pasif</option>
            <option value="SUSPENDED">Askıda</option>
            <option value="LOCKED">Kilitli</option>
            <option value="INVITED">Davetli</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Filtrele
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-600">Kullanıcı</th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">Roller</th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">Departman</th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">Son Giriş</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Kullanıcı bulunamadı</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                    {user.isSuperAdmin && (
                      <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Süper Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((ur) => (
                        <RoleBadge key={ur.roleId} name={ur.role.name} color={ur.role.color} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.department ?? "—"}</td>
                  <td className="px-6 py-4">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "Hiç giriş yapmadı"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${user.id}`} className="text-amber-600 hover:underline text-xs font-medium">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">{total} kullanıcıdan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} gösteriliyor</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Önceki</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Sonraki</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
