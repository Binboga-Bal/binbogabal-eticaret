import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { ProductCard } from "@/components/shop/product/ProductCard";
import { ProductFilter } from "@/components/shop/product/ProductFilter";
import type { HoneyType, PackagingType, Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description: "Binboğa Kooperatif Balı ürün kataloğu. Doğal, analizi yapılmış bal çeşitleri.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tur?: string;
    ambalaj?: string;
    boyut?: string;
    siralama?: string;
    sayfa?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params.tur && { honeyType: params.tur as HoneyType }),
    ...(params.boyut || params.ambalaj
      ? {
          variants: {
            some: {
              isActive: true,
              ...(params.boyut && { size: parseInt(params.boyut) }),
              ...(params.ambalaj && { packagingType: params.ambalaj as PackagingType }),
            },
          },
        }
      : {}),
  };

  const page = parseInt(params.sayfa ?? "1");

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
        },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy:
        params.siralama === "fiyat-asc"
          ? {}
          : params.siralama === "yeni"
          ? { createdAt: "desc" }
          : { isBestseller: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const products = rawProducts.map(serializeProduct);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-48 bg-honey-light overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-black text-honey-dark">Her Damlası Bir Emek...</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,40 1440,15 L1440,40 Z" fill="white" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <Suspense>
            <ProductFilter />
          </Suspense>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{total}</span> ürün bulundu
              </p>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey">
                <option value="">Sıralama</option>
                <option value="yeni">En Yeni</option>
                <option value="fiyat-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="fiyat-desc">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">Bu filtreye uygun ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`?${new URLSearchParams({ ...params, sayfa: String(p) })}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-honey-dark text-white"
                        : "border border-gray-300 text-gray-600 hover:border-honey-dark hover:text-honey-dark"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
