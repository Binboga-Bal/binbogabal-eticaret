import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { HeroSlider } from "@/components/shop/home/HeroSlider";
import { TrustBadges } from "@/components/shop/home/TrustBadges";
import { CategoryGrid } from "@/components/shop/home/CategoryGrid";
import { ProcessFlow } from "@/components/shop/home/ProcessFlow";
import { FaqSection } from "@/components/shop/home/FaqSection";
import { ProductCard } from "@/components/shop/product/ProductCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kozan'dan Doğal Bal | Binboğa Kooperatif Balı",
  description:
    "1973'ten bu yana 745 Sayılı Kozan Bal Tarım Satış Kooperatifi. Doğal, analizi yapılmış kooperatif balı.",
};

export const dynamic = "force-dynamic";

async function getBestsellers() {
  return prisma.product.findMany({
    where: { isActive: true, isBestseller: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
    },
    take: 8,
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
    },
    take: 8,
  });
}

async function getFaqs() {
  return prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 6,
  });
}

export default async function HomePage() {
  const [rawBestsellers, rawFeatured, faqs] = await Promise.all([
    getBestsellers(),
    getFeaturedProducts(),
    getFaqs(),
  ]);

  const bestsellers = rawBestsellers.map(serializeProduct);
  const featured = rawFeatured.map(serializeProduct);

  return (
    <>
      <HeroSlider />
      <TrustBadges />

      <CategoryGrid />

      <ProcessFlow />

      {/* Çok Satanlar */}
      {bestsellers.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="bg-honey-dark text-white text-sm font-bold px-3 py-1 rounded">
                  ÇOK SATANLAR
                </span>
              </div>
              <Link
                href="/urunlerimiz"
                className="text-sm text-honey-dark font-semibold hover:underline"
              >
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hikayemiz */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-honey-dark">
          <div className="absolute inset-0 bg-honey-dark/90" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-white font-black text-3xl mb-2">HİKAYEMİZ</h2>
            <p className="text-honey-bright font-bold text-lg mb-4">ŞİRKET DEĞİL, KOOPERATİF!</p>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına
              ayakta kalmanın zor olduğunu biliyorlardı. İşte o gün, yükü paylaşmak için bir araya
              geldiler. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi böyle doğdu.
            </p>
            <Link href="/hakkimizda" className="btn-secondary inline-flex items-center gap-2">
              HİKAYENİN DEVAMI ▶
            </Link>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="bg-white/10 rounded-full w-32 h-32 flex flex-col items-center justify-center text-white text-center">
              <span className="font-black text-3xl text-honey-bright">1800</span>
              <span className="text-xs font-medium">Arıcı Üye</span>
            </div>
          </div>
        </div>
      </section>

      {/* Avantajlı Ürünler */}
      {featured.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <span className="bg-honey-dark text-white text-sm font-bold px-3 py-1 rounded">
                AVANTAJLI ÜRÜNLER
              </span>
              <Link
                href="/urunlerimiz?filtre=avantajli"
                className="text-sm text-honey-dark font-semibold hover:underline"
              >
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hakkımızda banner */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="flex gap-4 mb-6">
                <div className="text-center">
                  <div className="font-black text-sm text-gray-500">LONDON</div>
                  <div className="bg-honey text-white text-xs font-bold px-2 py-0.5 rounded">HONEY GOLD</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xs text-gray-500">GLOBAL</div>
                  <div className="font-black text-honey-dark">HONEY STARS</div>
                </div>
              </div>
              <div className="rounded-2xl bg-honey-light aspect-video flex items-center justify-center text-6xl">
                🍯
              </div>
            </div>

            <div className="flex-1 max-w-lg">
              <div className="mb-3">
                <span className="bg-honey text-white text-sm font-bold px-3 py-1 rounded">
                  HAKKIMIZDA
                </span>
                <span className="ml-3 text-sm font-semibold text-gray-600">ÜLKE İÇİN KOOPERATİF</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Binboğa Bal, 1973 yılında Adana'nın Kozan ilçesinde kurulan S.S. 745 Sayılı Kozan
                Bal Tarım Satış Kooperatifi tarafından üretilmektedir. Kooperatif yapımız sayesinde
                arıcılarımıza en yüksek kalite ve fiyatı sunuyor, tüketiciyle en doğrudan köprüyü
                kuruyoruz.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-honey-bright rounded-full w-24 h-24 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-gray-700">Ulusal</span>
                  <span className="text-xs font-black text-honey-dark">Arıcı</span>
                  <span className="text-xs font-bold text-gray-700">Ödülleri</span>
                </div>
              </div>
              <Link href="/hakkimizda" className="btn-primary inline-flex items-center gap-2">
                DEVAMINI OKU ▶
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
