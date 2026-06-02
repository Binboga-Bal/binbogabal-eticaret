import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserStatusBadge } from "@/components/admin/rbac/UserStatusBadge";
import { RoleBadge } from "@/components/admin/rbac/RoleBadge";
import { UserDetailActions } from "@/components/admin/rbac/UserDetailActions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("admin_users", "view");
  const { id } = await params;

  const [admin, allRoles, sessions] = await Promise.all([
    prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        allowedIPs: true,
        temporaryPermissions: {
          where: { isActive: true, validUntil: { gt: new Date() } },
          include: { permission: true },
        },
      },
    }),
    prisma.adminRole.findMany({ orderBy: { name: "asc" } }),
    prisma.adminSession.findMany({
      where: { userId: id, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: "desc" },
      take: 5,
    }),
  ]);

  if (!admin) notFound();

  const recentLogs = await prisma.auditLog.findMany({
    where: { adminId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{admin.name}</h1>
            <UserStatusBadge status={admin.status} />
            {admin.isSuperAdmin && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Süper Admin</span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{admin.email}</p>
          {admin.department && <p className="text-sm text-gray-500">{admin.department}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="text-sm text-gray-500 hover:underline">← Listeye dön</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roles */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Roller</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {admin.roles.map((ur) => (
                <RoleBadge key={ur.roleId} name={ur.role.name} color={ur.role.color} />
              ))}
              {admin.roles.length === 0 && <span className="text-sm text-gray-400">Rol atanmamış</span>}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Aktif Oturumlar ({sessions.length})</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400">Aktif oturum yok</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.ipAddress ?? "Bilinmeyen IP"}</p>
                      <p className="text-xs text-gray-500">{s.userAgent?.slice(0, 60) ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Son aktif: {new Date(s.lastActiveAt).toLocaleString("tr-TR")}</p>
                      {s.isSuspicious && <span className="text-xs text-red-600 font-medium">Şüpheli</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Temporary Permissions */}
          {admin.temporaryPermissions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Geçici İzinler</h2>
              <div className="space-y-2">
                {admin.temporaryPermissions.map((tp) => (
                  <div key={tp.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-mono text-gray-700">{tp.permission.module}:{tp.permission.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(tp.validUntil).toLocaleDateString("tr-TR")} tarihine kadar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-400">Aktivite yok</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-500 ml-2">{log.module}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Son giriş</span>
              <p className="font-medium">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString("tr-TR") : "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Son IP</span>
              <p className="font-medium font-mono text-xs">{admin.lastLoginIp ?? "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">2FA</span>
              <p className="font-medium">{admin.twoFactorEnabled ? "Aktif" : "Pasif"}</p>
            </div>
            <div>
              <span className="text-gray-500">Kayıt tarihi</span>
              <p className="font-medium">{new Date(admin.createdAt).toLocaleDateString("tr-TR")}</p>
            </div>
            {admin.allowedIPs.length > 0 && (
              <div>
                <span className="text-gray-500">IP Kısıtlaması</span>
                {admin.allowedIPs.map((ip) => (
                  <p key={ip.id} className="font-mono text-xs">{ip.ipRange} {ip.label ? `(${ip.label})` : ""}</p>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <UserDetailActions adminId={id} status={admin.status} isSuperAdmin={admin.isSuperAdmin} />
        </div>
      </div>
    </div>
  );
}
