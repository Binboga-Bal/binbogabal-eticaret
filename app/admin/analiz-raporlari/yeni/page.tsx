import { requirePermission } from "@/lib/rbac/guards";
import { BatchForm } from "@/components/admin/BatchForm";

export const metadata = { title: "Yeni Analiz Raporu | Admin" };

export default async function NewBatchPage() {
  await requirePermission("products", "create");

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Yeni Parti / Analiz Raporu</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <BatchForm />
      </div>
    </div>
  );
}
