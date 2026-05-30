import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null, showOnHome: true },
    orderBy: { order: "asc" },
    take: 8,
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Ürün Kategorileri</h2>
          <span className="text-sm text-honey-dark font-semibold hover:underline cursor-pointer">
            Tüm Ürünler →
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunlerimiz?kategori=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[5/3] shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-honey-light" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-sm leading-tight drop-shadow">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
