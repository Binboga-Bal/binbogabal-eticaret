export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryEditRow } from "@/components/admin/CategoryEditRow";

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
          <p className="px-5 pt-3 text-xs text-gray-400">
            Görsel eklemek için kategori ikonuna tıklayın.
          </p>
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <CategoryEditRow key={cat.id} category={cat} />
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
