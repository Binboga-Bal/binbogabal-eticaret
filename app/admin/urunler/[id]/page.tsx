import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Ürün Düzenle | Admin" };

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;

  const isNew = id === "yeni";

  const rawProduct = isNew
    ? null
    : await prisma.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { size: "asc" } }, category: true },
      });

  if (!isNew && !rawProduct) notFound();

  const product = rawProduct ? serializeProduct(rawProduct) : null;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/urunler" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">
          {isNew ? "Yeni Ürün" : `Düzenle: ${rawProduct?.name}`}
        </h1>
      </div>

      <ProductEditForm product={product} categories={categories} />
    </div>
  );
}
