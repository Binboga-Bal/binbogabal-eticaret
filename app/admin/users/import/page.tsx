import { requirePermission } from "@/lib/rbac/guards";
import { BulkUserImport } from "@/components/admin/rbac/BulkUserImport";

export const dynamic = "force-dynamic";

export default async function ImportUsersPage() {
  await requirePermission("admin_users", "create");
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Toplu Kullanıcı Import</h1>
      <BulkUserImport />
    </div>
  );
}
