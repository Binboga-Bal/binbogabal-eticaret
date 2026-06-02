// Ürün detayı statik üretilir, ISR ile 10 dk'da bir tazelenir.
// ERP senkronu /urunlerimiz/[slug] yolunu on-demand revalidate eder.
export const revalidate = 600;
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Clock,
  ShieldCheck,
  ThumbsUp,
  Package,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { Container } from "@/components/layout/Container";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { ProductVariantSelector } from "@/components/shop/product/ProductVariantSelector";
import { ProductTabs } from "@/components/shop/product/ProductTabs";
import { ProductImageGallery } from "@/components/shop/product/ProductImageGallery";
import { FavoriteButton } from "@/components/shop/product/FavoriteButton";
import { ProductTasteProfile } from "@/components/shop/product/ProductTasteProfile";

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

// Tüm aktif ürünleri build'de prerender et → Full Route Cache + ISR.
// Bu olmadan dinamik route her istekte DB sorgusu yapardı.
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün Bulunamadı" };

  return {
    title: product.metaTitle ?? product.name,
    description:
      product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: (product.images as string[])[0]
        ? [(product.images as string[])[0]]
        : [],
    },
  };
}


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
    <Container className="pt-24 pb-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-honey-dark transition-colors">
          Anasayfa
        </Link>
        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
        <Link
          href="/urunlerimiz"
          className="hover:text-honey-dark transition-colors"
        >
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
        <span className="text-gray-800 font-medium">
          {product.name}
        </span>
      </nav>

      {/* Ana grid — mobil: tek kolon; lg+: iki kolon; sağ kolon sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
        {/* Sol: Görsel galerisi */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Sağ: Ürün bilgileri — lg'de sticky */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-32">
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
          <h1 className="text-fluid-xl font-black text-gray-900 leading-tight">
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
          <ProductVariantSelector
            product={product}
            variants={product.variants}
          />

          {/* Favorilere ekle */}
          <FavoriteButton productId={product.id} />

          {/* Tahmini teslimat */}
          <div className="rounded-xl border border-honey-light bg-honey-cream/60 p-4 space-y-2.5">
            <p className="text-xs font-bold text-honey-dark uppercase tracking-wider mb-1">
              Teslimat Bilgisi
            </p>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <Truck
                size={16}
                className="text-honey-dark flex-shrink-0 mt-0.5"
              />
              <span>
                Siparişiniz <strong>2–4 iş günü</strong> içinde kapınıza teslim
                edilir
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <Clock
                size={16}
                className="text-honey-dark flex-shrink-0 mt-0.5"
              />
              <span>
                Saat <strong>14:00&apos;e kadar</strong> verilen siparişler aynı
                gün kargoya verilir
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-700">
              <ShieldCheck
                size={16}
                className="text-honey-dark flex-shrink-0 mt-0.5"
              />
              <span>
                Kooperatif üyelerine <strong>ücretsiz kargo</strong> — Güvenli
                ödeme sistemi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Özellik kartları */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <ThumbsUp size={28} className="text-gray-700" />,
            title: "Kooperatif Üretimi",
            desc: "1972'ten beri kooperatif güvencesi",
          },
          {
            icon: <Package size={28} className="text-gray-700" />,
            title: "Güvenli Paketleme",
            desc: "Özenli ve sağlam ambalaj",
          },
          {
            icon: <Heart size={28} className="text-gray-700" />,
            title: "Müşteri Memnuniyeti",
            desc: "%100 memnuniyet garantisi",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-[#F8F3EE] px-6 py-8 text-center"
          >
            {item.icon}
            <p className="font-bold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Sekmeler: Açıklama / Hangi Balcıdan */}
      <div className="mt-12">
        <ProductTabs
          description={product.description ?? ""}
          shortDescription={product.shortDescription ?? ""}
          analysisReportUrl={
            (product as { analysisReportUrl?: string | null }).analysisReportUrl
          }
          reviews={reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
            user: { name: r.user.name },
          }))}
        />
      </div>

      {/* Ürün Hikayesi */}
      <div className="mt-12 rounded-3xl bg-[#FFF8EE] overflow-hidden">
        <div className="grid grid-cols-1  md:grid-cols-2 gap-0">
          {/* Sol: metin */}
          <div className="flex flex-col justify-center px-8 py-12 lg:px-14">
            <p className="text-sm font-bold text-gray-700 mb-2">
              Ürün Hikayesi:
            </p>
            <h2 className="text-2xl md:text-2xl font-black text-gray-900 leading-snug mb-6">
              Anadolu&apos;nun Kalbinden Sofranıza,
              <br />
              Arıcı Ailelerimizin Ortak Emeği
            </h2>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Kooperatif çiftçileri ve arıcıları olarak köklü çabamızın ve çok
                aşamalı emeklerin, toprağından sahip olduğu yolculuğun izlerini
                sofralarınıza ulaştırıyoruz.
              </p>
              <p>
                Her kavanoz, yalnızca bal değil; arıcılarımızın emeğini, doğanın
                bereketini ve Anadolu&apos;nun eşsiz florasını sofralarınıza
                taşır.
              </p>
              <p>
                Anadolu&apos;nun kırsal bölgelerinde üretimi yapılan balımız,
                doğal yapısı ve geleneksel üretim anlayışıyla güvenle
                tüketilebilir.
              </p>
            </div>
          </div>

          {/* Sağ: görsel */}
          <div className="relative min-h-[320px] md:min-h-0">
            <Image
              src="/images/product-detail/kooperatif-ailesi.webp"
              alt="Kooperatif arıcıları"
              fill
              className="object-cover rounded-3xl md:rounded-none md:rounded-r-3xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Altın rozet 
            <div
              className="absolute bottom-6 right-6 flex flex-col items-center justify-center text-center"
              style={{
                width: 110,
                height: 110,
                background: "#F9B10B",
                clipPath:
                  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              }}
            >
              <span className="text-3xl font-black text-gray-900 leading-none">
                1700
              </span>
              <span className="text-[10px] font-bold text-gray-800 leading-tight mt-0.5">
                Kooperatif
                <br />
                Ailesi
              </span>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Tat Profili ve Kullanım Önerileri */}
      <ProductTasteProfile
        tasteNotes={(product.tasteNotes as string[]) ?? []}
        usageSuggestions={(product.usageSuggestions as string[]) ?? []}
      />

      {/* Video alanı 
      <div className="mt-10 rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
        <p className="text-gray-400">Ürün videosu burada görüntülenecek</p>
      </div>
*/}
      {/* Güven bandı */}
      <div className="mt-10">
        <div className="border border-gray-200 rounded-2xl px-4 sm:px-7 py-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-y-5">
          {/* Sol: Kooperatif gücü */}
          <div className="flex items-center gap-3 pb-4 sm:pb-0 sm:pr-7 border-b sm:border-b-0 sm:border-r border-gray-200 sm:mr-7 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <svg
              viewBox="0 0 44 50"
              className="w-14 h-14 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            >
              <path d="M22 2 L41 13 L41 37 L22 48 L3 37 L3 13 Z" />
              <path d="M22 11 L33 17.5 L33 30.5 L22 37 L11 30.5 L11 17.5 Z" />
            </svg>
            <div className="leading-snug">
              <p className="text-[12px] font-black text-gray-900 uppercase tracking-wide">
                KOOPERATİF GÜCÜ
              </p>
              <p className="text-[12px] font-black text-gray-900 uppercase tracking-wide">
                HEPİMİZ İÇİN DEĞER ÜRETİR.
              </p>
            </div>
          </div>

          {/* Sağ: 4 değer */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 flex-1 justify-evenly min-w-0 w-full sm:w-auto">
            {[
              {
                /* Arıcı kıyafetli kişi: yuvarlak kafa, siperlikli şapka, gövde */
                icon: (
                  <svg
                    viewBox="0 0 32 32"
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Baş */}
                    <circle cx="16" cy="10" r="4.5" />
                    {/* Arıcı şapkası: geniş ağzı olan kep */}
                    <path d="M10 8.5 Q10 3 16 3 Q22 3 22 8.5" />
                    <line x1="8.5" y1="8.5" x2="23.5" y2="8.5" />
                    {/* Peçe çizgisi (şapkadan aşağı inen) */}
                    <path
                      d="M10 8.5 L9 15 M22 8.5 L23 15"
                      strokeDasharray="1.5 1.5"
                    />
                    {/* Boyun/omuzlar */}
                    <path d="M11 14.5 C7 16 5 20 5 26 L27 26 C27 20 25 16 21 14.5" />
                    {/* Gövde orta çizgi */}
                    <line x1="16" y1="14.5" x2="16" y2="26" />
                    {/* Kol sol */}
                    <path d="M9 18 L4 22" />
                    {/* Kol sağ */}
                    <path d="M23 18 L28 22" />
                  </svg>
                ),
                label: "Arıcı için\nadil gelir",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 32 32"
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 3 L28 8.5 L28 17 C28 23.5 22.5 28.5 16 30 C9.5 28.5 4 23.5 4 17 L4 8.5 Z" />
                    <polyline points="11,16 14,19 21,12" />
                  </svg>
                ),
                label: "Kaliteli ve\ngüvenilir ürün",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 32 32"
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="16" cy="10" r="5" />
                    <path d="M6 28 C6 22 10.5 18 16 18 C21.5 18 26 22 26 28" />
                  </svg>
                ),
                label: "Tüketici için\ntam güven",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 32 32"
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10 C22 10 23.5 4 16 3 C16 3 17 9 12 11.5 C9 13 7 17 8 22 C9.5 26 13 29 17 29 C22 29 27 25 27 19.5 C27 14 22 10 22 10 Z" />
                    <path d="M16 29 C16 29 15 23 19 19" />
                  </svg>
                ),
                label: "Doğa için\nsürdürülebilir gelecek",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="hidden sm:inline text-gray-300 text-xl font-light select-none leading-none">
                    +
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-700 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-[12px] text-gray-700 leading-snug whitespace-pre-line">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SVG Arı ayırıcı */}
        <div className="flex items-center gap-4 mt-7 px-4">
          <div className="flex-1 h-px bg-gray-200" />
          <svg
            viewBox="0 0 48 32"
            className="w-10 h-7 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Gövde */}
            <ellipse
              cx="24"
              cy="19"
              rx="9"
              ry="6.5"
              fill="currentColor"
              fillOpacity="0.06"
            />
            {/* Baş */}
            <circle
              cx="33"
              cy="16"
              r="3.5"
              fill="currentColor"
              fillOpacity="0.08"
            />
            {/* Gözler */}
            <circle cx="34.5" cy="14.8" r="0.7" fill="currentColor" />
            <circle cx="35.5" cy="16.2" r="0.7" fill="currentColor" />
            {/* Kanatlar */}
            <ellipse
              cx="20"
              cy="11"
              rx="7"
              ry="4"
              transform="rotate(-15 20 11)"
              fill="currentColor"
              fillOpacity="0.1"
            />
            <ellipse
              cx="27"
              cy="10"
              rx="7"
              ry="4"
              transform="rotate(15 27 10)"
              fill="currentColor"
              fillOpacity="0.1"
            />
            {/* Şerit çizgileri */}
            <line x1="17" y1="18" x2="17" y2="21" />
            <line x1="21" y1="17" x2="21" y2="22.5" />
            <line x1="25" y1="17" x2="25" y2="23" />
            <line x1="29" y1="18" x2="29" y2="21" />
            {/* İğne */}
            <path d="M15 19.5 L10 21" />
            {/* Anten */}
            <path d="M33 12.5 Q35 9 38 8" />
            <path d="M35 13 Q37 10 40 10" />
            <circle cx="38" cy="8" r="1" fill="currentColor" />
            <circle cx="40" cy="10" r="1" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
    </Container>
  );
}
