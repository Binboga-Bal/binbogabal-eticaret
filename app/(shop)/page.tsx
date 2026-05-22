import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { HeroSlider } from "@/components/shop/home/HeroSlider";
import { TrustBadges } from "@/components/shop/home/TrustBadges";
import { CategoryGrid } from "@/components/shop/home/CategoryGrid";
import { ProcessFlow } from "@/components/shop/home/ProcessFlow";
import { FaqSection } from "@/components/shop/home/FaqSection";
import { ProductCard } from "@/components/shop/product/ProductCard";
import { homeBannersTheme } from "@/lib/theme";
import Link from "next/link";
import Image from "next/image";

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
                <span className="bg-honey-medium text-white text-lg font-bold px-4 py-2 pr-8 rounded">
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
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center">
        <Image
          src={homeBannersTheme.hikayemiz.image}
          alt="Hikayemiz arkaplan"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="relative w-full py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-white font-black text-3xl mb-2">{homeBannersTheme.hikayemiz.heading}</h2>
            <p className="text-honey-bright font-bold text-lg mb-4">{homeBannersTheme.hikayemiz.subheading}</p>
            <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {homeBannersTheme.hikayemiz.body}
            </p>
            <Link href={homeBannersTheme.hikayemiz.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
              {homeBannersTheme.hikayemiz.btn.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Avantajlı Ürünler */}
      {featured.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <span className="bg-honey-medium text-white text-lg font-bold px-4 py-2 pr-8 rounded">
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
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center">
        <Image
          src={homeBannersTheme.hakkimizda.image}
          alt="Hakkımızda arkaplan"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="relative w-full py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <div className="max-w-lg">
            <h2 className="text-white font-black text-3xl mb-2">{homeBannersTheme.hakkimizda.heading}</h2>
            <p className="text-honey-bright font-bold text-lg mb-4">{homeBannersTheme.hakkimizda.subheading}</p>
            <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {homeBannersTheme.hakkimizda.body}
            </p>
            <Link href={homeBannersTheme.hakkimizda.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
              {homeBannersTheme.hakkimizda.btn.label}
            </Link>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
