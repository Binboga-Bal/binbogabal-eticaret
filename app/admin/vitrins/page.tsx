export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { VitrinManager } from "@/components/admin/VitrinManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Vitrin Yönetimi | Admin" };

export default async function VitrinsPage() {
  await requirePermission("products", "view");

  const [bestsellers, featured, allProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isBestseller: true },
      select: { id: true, name: true, slug: true, images: true, isBestseller: true, isFeatured: true, bestsellOrder: true, featuredOrder: true, isActive: true },
      orderBy: { bestsellOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isFeatured: true },
      select: { id: true, name: true, slug: true, images: true, isBestseller: true, isFeatured: true, bestsellOrder: true, featuredOrder: true, isActive: true },
      orderBy: { featuredOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, images: true, isBestseller: true, isFeatured: true, bestsellOrder: true, featuredOrder: true, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
        <Link href="/admin/sayfalar/anasayfa" className="text-gray-400 hover:text-gray-600 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Vitrin Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Anasayfadaki vitrinlerin içeriğini ve sırasını buradan yönetin.
            Ürünleri sürükleyerek yeniden sıralayın, &ldquo;Ürün Ekle&rdquo; ile vitrine ekleyin.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Not:</strong> &ldquo;Yanında İyi Gider&rdquo; vitrini her ürün detay sayfasında ayrıca yönetilir.
        İlgili ürünü düzenlerken &ldquo;Yanında İyi Gider&rdquo; bölümüne bakın.
      </div>

      <VitrinManager
        bestsellers={bestsellers as Parameters<typeof VitrinManager>[0]["bestsellers"]}
        featured={featured as Parameters<typeof VitrinManager>[0]["featured"]}
        allProducts={allProducts as Parameters<typeof VitrinManager>[0]["allProducts"]}
      />
    </div>
  );
}
