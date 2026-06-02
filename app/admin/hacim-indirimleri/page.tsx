export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { VolumeDiscountManager } from "@/components/admin/VolumeDiscountManager";

export const metadata = { title: "Hacim İndirimleri | Admin" };

export default async function VolumeDiscountsPage() {
  await requirePermission("volume_discounts", "view");
  const rules = await prisma.volumeDiscount.findMany({
    include: {
      products: {
        include: { product: { select: { id: true, name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Hacim İndirimleri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Belirli adet ürün satın alındığında otomatik uygulanan kademeli indirim kuralları.
        </p>
      </div>
      <VolumeDiscountManager initialRules={rules as never} />
    </div>
  );
}
