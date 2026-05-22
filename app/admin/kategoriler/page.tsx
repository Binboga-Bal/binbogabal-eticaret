import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import Image from "next/image";

export const metadata = { title: "Kategoriler | Admin" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Kategoriler</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mevcut kategoriler */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b font-bold text-gray-800">
            Mevcut Kategoriler ({categories.length})
          </div>
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="px-5 py-4 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-honey-light flex-shrink-0">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍯</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.slug} · {cat._count.products} ürün</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {cat.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz kategori yok</p>
            )}
          </div>
        </div>

        {/* Yeni kategori formu */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-5">Yeni Kategori</h2>
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}
