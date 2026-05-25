import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { formatPrice, formatWeight, calculateDiscount } from "@/lib/utils/format";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { ProductVariantSelector } from "@/components/shop/product/ProductVariantSelector";
import { ProductTabs } from "@/components/shop/product/ProductTabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün Bulunamadı" };

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: (product.images as string[])[0] ? [(product.images as string[])[0]] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const rawProduct = await getProduct(slug);
  if (!rawProduct) notFound();

  const product = serializeProduct(rawProduct);
  const images = product.images;
  const defaultVariant = product.variants[0];
  const reviews = rawProduct.reviews;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Görseller */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border flex items-center justify-center">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-contain p-6"
                priority
              />
            ) : (
              <span className="text-8xl">🍯</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border-2 border-honey-dark cursor-pointer"
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün bilgileri */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">{product.name}</h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm font-medium text-gray-600">
                {avgRating.toFixed(1)} ({reviews.length} yorum)
              </span>
            </div>
          )}

          <ProductVariantSelector product={product} variants={product.variants} />

          {/* Kargo ve güven */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🚚</span>
              <span>Üyelere Özel Kargo Ücretsiz</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🔒</span>
              <span>Güvenli Ödeme Sistemi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Açıklama / Hangi Balcıdan */}
      <div className="mt-12">
        <ProductTabs
          description={product.description ?? ""}
          shortDescription={product.shortDescription ?? ""}
        />
      </div>

      {/* Video section placeholder */}
      <div className="mt-10 rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
        <p className="text-gray-400">Ürün videosu burada görüntülenecek</p>
      </div>

      {/* Trust bar */}
      <div className="mt-10 border border-honey-light rounded-2xl px-6 py-5">
        <div className="flex flex-wrap justify-around gap-6 text-center text-xs text-gray-600">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🤝</span>
            <span className="font-bold text-honey-dark">KOOPERATİF GÜCÜ</span>
            <span>HEPİMİZ İÇİN DEĞER ÜRETIR</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🐝</span>
            <span className="font-bold">Arıcı için</span>
            <span>adil gelir</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">✅</span>
            <span className="font-bold">Kaliteli ve</span>
            <span>güvenilir ürün</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👤</span>
            <span className="font-bold">Tüketici için</span>
            <span>tam güven</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🌿</span>
            <span className="font-bold">Doğa için</span>
            <span>sürdürülebilir gelecek</span>
          </div>
        </div>
      </div>
    </div>
  );
}
