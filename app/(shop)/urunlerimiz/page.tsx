import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { ProductCard } from "@/components/shop/product/ProductCard";
import { ProductFilter } from "@/components/shop/product/ProductFilter";
import { SortSelect } from "@/components/shop/product/SortSelect";
import type { PackagingType, Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description: "Binboğa Kooperatif Balı ürün kataloğu. Doğal, analizi yapılmış bal çeşitleri.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tur?: string;
    kategori?: string;
    bestseller?: string;
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

  const [honeyTypes, allCategories] = await Promise.all([
    prisma.honeyType.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, label: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
    }),
  ]);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params.q && {
      OR: [
        { name:             { contains: params.q } },
        { shortDescription: { contains: params.q } },
        { honeyTypes: { some: { label: { contains: params.q }, isActive: true } } },
        { categories: { some: { name:  { contains: params.q }, isActive: true } } },
      ],
    }),
    ...(params.tur && {
      honeyTypes: { some: { slug: params.tur, isActive: true } },
    }),
    ...(params.kategori && {
      categories: { some: { slug: params.kategori, isActive: true } },
    }),
    ...(params.bestseller === "1" && { isBestseller: true }),
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
  const isFiyatSort = params.siralama === "fiyat-asc" || params.siralama === "fiyat-desc";

  const [fetchedProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
        },
      },
      ...(isFiyatSort ? {} : {
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      orderBy:
        params.siralama === "yeni"
          ? { createdAt: "desc" }
          : { isBestseller: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const rawProducts = isFiyatSort
    ? fetchedProducts
        .sort((a, b) => {
          const minPrice = (p: typeof a) =>
            p.variants.length
              ? Math.min(...p.variants.map((v) => Number(v.discountedPrice ?? v.price)))
              : 0;
          return params.siralama === "fiyat-asc"
            ? minPrice(a) - minPrice(b)
            : minPrice(b) - minPrice(a);
        })
        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : fetchedProducts;

  const products = rawProducts.map(serializeProduct);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Dinamik breadcrumb
  type BreadcrumbItem = { label: string; href?: string };
  const breadcrumb: BreadcrumbItem[] = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Ürünlerimiz", href: params.q || params.tur || params.kategori || params.bestseller ? "/urunlerimiz" : undefined },
  ];
  if (params.q) {
    breadcrumb.push({ label: `"${params.q}"`, href: `/urunlerimiz?q=${encodeURIComponent(params.q)}` });
  } else if (params.tur) {
    const ht = honeyTypes.find((t) => t.slug === params.tur);
    if (ht) breadcrumb.push({ label: ht.label, href: `/urunlerimiz?tur=${params.tur}` });
  } else if (params.kategori) {
    const cat = allCategories.find((c) => c.slug === params.kategori);
    if (cat) breadcrumb.push({ label: cat.name, href: `/urunlerimiz?kategori=${params.kategori}` });
  } else if (params.bestseller === "1") {
    breadcrumb.push({ label: "En Çok Satanlar", href: `/urunlerimiz?bestseller=1` });
  }

  const Breadcrumb = () => (
    <nav className="flex items-center gap-1.5 text-sm mb-1 flex-wrap">
      {breadcrumb.map((item, i) => {
        const isLast = i === breadcrumb.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className={
                  isLast
                    ? "text-honey-dark font-medium"
                    : "text-gray-500 hover:text-honey-dark transition-colors"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-honey-dark font-medium">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );

  return (
    <div>
      {params.q ? (
        /* Arama sonuçları başlığı */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <Breadcrumb />
          <div className="mt-2">
            <h1 className="text-2xl font-black text-gray-800">
              &ldquo;{params.q}&rdquo; için sonuçlar
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} ürün bulundu</p>
            <Link
              href="/urunlerimiz"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 text-sm font-medium border border-honey-dark text-honey-dark rounded-lg hover:bg-honey-dark hover:text-white transition-colors"
            >
              ← Tüm Ürünlere Dön
            </Link>
          </div>
        </div>
      ) : (
        <>
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
                <Breadcrumb />
                <h1 className="text-3xl font-black text-gray-800">Ürünlerimiz</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "İlk Kez Alacaklar", paramKey: "kategori", paramValue: "ilk-kez-alacaklar-serisi" },
                  { label: "En Çok Tercih Edilenler", paramKey: "bestseller", paramValue: "1" },
                  { label: "Avantajlı Setler", paramKey: "kategori", paramValue: "kooperatif-avantajli-urunler-serisi" },
                ].map(({ label, paramKey, paramValue }) => {
                  const isActive = params[paramKey as keyof typeof params] === paramValue;
                  const sp = new URLSearchParams(
                    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
                  );
                  sp.delete("kategori");
                  sp.delete("bestseller");
                  if (!isActive) sp.set(paramKey, paramValue);
                  const href = sp.toString() ? `?${sp.toString()}` : "/urunlerimiz";
                  return (
                    <Link
                      key={label}
                      href={href}
                      scroll={false}
                      className={`px-4 py-2 text-sm font-medium border border-honey-dark rounded-lg transition-colors ${
                        isActive ? "bg-honey-dark text-white" : "text-honey-dark hover:bg-honey-dark hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <ProductFilter honeyTypes={honeyTypes} />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{total}</span> ürün bulundu
              </p>
              <SortSelect currentSort={params.siralama ?? ""} />
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
