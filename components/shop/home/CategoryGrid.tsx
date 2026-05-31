import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/Container";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null, showOnHome: true },
    orderBy: { order: "asc" },
    take: 8,
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-20 bg-gray-50">
      <Container size="content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-fluid-xl font-black text-gray-900 tracking-tight">Ürün Kategorileri</h2>
          <Link href="/urunlerimiz" className="text-sm text-honey-dark font-semibold hover:underline">
            Tüm Ürünler →
          </Link>
        </div>

        {/* Grid: xs:2 sm:3 lg:4 3xl:5 4xl:6 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 3xl:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunlerimiz?kategori=${cat.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[16/9] shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
      </Container>
    </section>
  );
}
