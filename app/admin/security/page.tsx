import { requireSuperAdmin } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { SecuritySettingsForm } from "@/components/admin/rbac/SecuritySettingsForm";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireSuperAdmin();

  const [policy, activeSessions, globalIPs] = await Promise.all([
    prisma.passwordPolicy.findFirst(),
    prisma.adminSession.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.adminAllowedIP.findMany({ where: { userId: null } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Güvenlik Ayarları</h1>

      {/* Active sessions summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-gray-900">{activeSessions}</div>
          <div className="text-sm text-gray-500 mt-1">Aktif Oturum</div>
          <a href="/api/admin/security/active-sessions" className="text-xs text-amber-600 hover:underline mt-1 block">Görüntüle</a>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-gray-900">{globalIPs.length}</div>
          <div className="text-sm text-gray-500 mt-1">Global IP Kuralı</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-gray-900">{policy?.require2FAForRoles?.length ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">2FA Zorunlu Rol</div>
        </div>
      </div>

      <SecuritySettingsForm policy={policy} globalIPs={globalIPs} />
    </div>
  );
}
