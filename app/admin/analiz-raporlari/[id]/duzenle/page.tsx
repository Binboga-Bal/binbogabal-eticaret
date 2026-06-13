import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { BatchForm } from "@/components/admin/BatchForm";

export const metadata = { title: "Analiz Raporu Düzenle | Admin" };

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products", "edit");
  const { id } = await params;

  const batch = await prisma.honeyBatch.findUnique({ where: { id } });
  if (!batch) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analiz Raporu Düzenle</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{batch.batchNumber}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <BatchForm
          initialData={{
            id: batch.id,
            batchNumber: batch.batchNumber,
            productName: batch.productName,
            productionDate: batch.productionDate.toISOString(),
            analysisDate: batch.analysisDate.toISOString(),
            expiryDate: batch.expiryDate.toISOString(),
            moistureContent: batch.moistureContent?.toString() ?? "",
            hmfValue: batch.hmfValue?.toString() ?? "",
            diastaseActivity: batch.diastaseActivity?.toString() ?? "",
            electricalConductivity: batch.electricalConductivity?.toString() ?? "",
            sucroseContent: batch.sucroseContent?.toString() ?? "",
            ph: batch.ph?.toString() ?? "",
            floraItems: batch.floraItems as never,
            floraNotes: batch.floraNotes ?? "",
            laboratoryName: batch.laboratoryName ?? "",
            isActive: batch.isActive,
          }}
        />
      </div>
    </div>
  );
}
