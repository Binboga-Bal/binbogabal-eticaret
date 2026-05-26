import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Truck, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { headerTheme } from "@/lib/theme";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { ProductVariantSelector } from "@/components/shop/product/ProductVariantSelector";
import { ProductTabs } from "@/components/shop/product/ProductTabs";
import { ProductImageGallery } from "@/components/shop/product/ProductImageGallery";
import { FavoriteButton } from "@/components/shop/product/FavoriteButton";

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
  const reviews = rawProduct.reviews;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      style={{ paddingTop: headerTheme.waveDepth }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-honey-dark transition-colors">
          Anasayfa
        </Link>
        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
        <Link href="/urunlerimiz" className="hover:text-honey-dark transition-colors">
          Ürünlerimiz
        </Link>
        {product.categories?.[0] && (
          <>
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            <Link
              href={`/urunlerimiz?kategori=${product.categories[0].slug}`}
              className="hover:text-honey-dark transition-colors"
            >
              {product.categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Ana grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Sol: Görsel galerisi (max 3 görsel) */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Sağ: Ürün bilgileri */}
        <div className="flex flex-col gap-4">
          {/* Kategori rozetleri */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map((cat) => (
                <Badge key={cat.id} variant="info">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Ürün adı */}
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Yıldız değerlendirme */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm font-medium text-gray-600">
                {avgRating.toFixed(1)} ({reviews.length} yorum)
              </span>
            </div>
          )}

          {/* Kısa açıklama */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-honey pl-3">
              {product.shortDescription}
            </p>
          )}

          {/* Varyant seçici (fiyat + gram seçimi + sepete ekle) */}
          <ProductVariantSelector product={product} variants={product.variants} />

          {/* Favorilere ekle */}
          <FavoriteButton productId={product.id} />

          {/* Tahmini teslimat */}
          <div className="rounded-xl border border-honey-light bg-honey-cream/60 p-4 space-y-2.5">
            <p className="text-xs font-bold text-honey-dark uppercase tracking-wider mb-1">
              Teslimat Bilgisi
            </p>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <Truck size={16} className="text-honey-dark flex-shrink-0 mt-0.5" />
              <span>
                Siparişiniz <strong>2–4 iş günü</strong> içinde kapınıza teslim edilir
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <Clock size={16} className="text-honey-dark flex-shrink-0 mt-0.5" />
              <span>
                Saat <strong>14:00&apos;e kadar</strong> verilen siparişler aynı gün kargoya verilir
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <ShieldCheck size={16} className="text-honey-dark flex-shrink-0 mt-0.5" />
              <span>
                Kooperatif üyelerine <strong>ücretsiz kargo</strong> — Güvenli ödeme sistemi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sekmeler: Açıklama / Hangi Balcıdan */}
      <div className="mt-12">
        <ProductTabs
          description={product.description ?? ""}
          shortDescription={product.shortDescription ?? ""}
        />
      </div>

      {/* Video alanı */}
      <div className="mt-10 rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
        <p className="text-gray-400">Ürün videosu burada görüntülenecek</p>
      </div>

      {/* Güven bandı */}
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
