import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { ProductCard } from "@/components/shop/product/ProductCard";
import { ProductFilter } from "@/components/shop/product/ProductFilter";
import type { PackagingType, Prisma } from "@prisma/client";

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
    minFiyat?: string;
    maxFiyat?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const hasVariantFilter = params.boyut || params.ambalaj || params.minFiyat || params.maxFiyat;

  const [honeyTypes, selectedHoneyType] = await Promise.all([
    prisma.honeyType.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, label: true },
    }),
    params.tur
      ? prisma.honeyType.findUnique({ where: { slug: params.tur }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(selectedHoneyType && { honeyTypeId: selectedHoneyType.id }),
    ...(hasVariantFilter
      ? {
          variants: {
            some: {
              isActive: true,
              ...(params.boyut && { size: parseInt(params.boyut) }),
              ...(params.ambalaj && { packagingType: params.ambalaj as PackagingType }),
              ...((params.minFiyat || params.maxFiyat) && {
                price: {
                  ...(params.minFiyat && { gte: parseFloat(params.minFiyat) }),
                  ...(params.maxFiyat && { lte: parseFloat(params.maxFiyat) }),
                },
              }),
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
      <div className="relative h-96 md:h-[520px] overflow-hidden">
        <Image
          src="/images/urunlerimiz/urunlerimiz-banner.webp"
          alt="Ürünlerimiz banner"
          fill
          className="object-cover"
          priority
        />
        {/* Karartma gradyanı — sol taraf okunabilirliği */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
        {/* Slogan */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl drop-shadow-2xl">
              <p className="font-script text-5xl md:text-6xl lg:text-7xl text-white leading-[1.2]">
                Arıcıdan Aracısız
              </p>
              <p className="font-script text-2xl md:text-3xl lg:text-4xl text-honey leading-snug mt-2">
                Kooperatif Tecrübesiyle
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-1px] left-0 right-0 z-30">
          <svg viewBox="0 0 1440 40" className="w-full block" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,40 1440,15 L1440,40 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Başlık & Hızlı Filtreler */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
              <Link href="/" className="hover:text-honey-dark transition-colors">Ana Sayfa</Link>
              <span>/</span>
              <span className="text-honey-dark font-medium">Ürünlerimiz</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-800">Ürünlerimiz</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "İlk Kez Alacaklar", href: "?tur=ilk-kez" },
              { label: "En Çok Tercih Edilenler", href: "?siralama=populer" },
              { label: "Avantajlı Setler", href: "?tur=set" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-4 py-2 text-sm font-medium border border-honey-dark text-honey-dark rounded-lg hover:bg-honey-dark hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <Suspense>
            <ProductFilter honeyTypes={honeyTypes} />
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
