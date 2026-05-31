import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/utils/serialize";
import { HeroSlider } from "@/components/shop/home/HeroSlider";
import { TrustBadges } from "@/components/shop/home/TrustBadges";
import { CategoryGrid } from "@/components/shop/home/CategoryGrid";
import { ProcessFlow } from "@/components/shop/home/ProcessFlow";
import { FaqSection } from "@/components/shop/home/FaqSection";
import { ProductCarousel } from "@/components/shop/home/ProductCarousel";
import { homeBannersTheme } from "@/lib/theme";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";

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
    take: 12,
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
    take: 12,
  });
}

async function getFaqs() {
  return prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 6,
  });
}

const IMAGE_KEYS = [
  "img_slider_1", "img_slider_2", "img_slider_3",
  "img_home_hikayemiz", "img_home_hakkimizda",
  "img_badge_1", "img_badge_2", "img_badge_3", "img_badge_4",
  "img_process_1", "img_process_2", "img_process_3", "img_process_4",
];

export default async function HomePage() {
  const [rawBestsellers, rawFeatured, faqs, imgSettings] = await Promise.all([
    getBestsellers(),
    getFeaturedProducts(),
    getFaqs(),
    prisma.siteSetting.findMany({ where: { key: { in: IMAGE_KEYS } } }),
  ]);

  const bestsellers = rawBestsellers.map(serializeProduct);
  const featured = rawFeatured.map(serializeProduct);
  const imgs = Object.fromEntries(imgSettings.map((s) => [s.key, s.value]));

  const sliderImages = [imgs.img_slider_1, imgs.img_slider_2, imgs.img_slider_3];
  const badgeImages = [imgs.img_badge_1, imgs.img_badge_2, imgs.img_badge_3, imgs.img_badge_4];
  const processImages = [imgs.img_process_1, imgs.img_process_2, imgs.img_process_3, imgs.img_process_4];
  const hikayemizImage = imgs.img_home_hikayemiz ?? homeBannersTheme.hikayemiz.image;
  const hakkimizdaImage = imgs.img_home_hakkimizda ?? homeBannersTheme.hakkimizda.image;

  return (
    <>
      <HeroSlider images={sliderImages} />
      <TrustBadges images={badgeImages} />

      <CategoryGrid />

      <ProcessFlow images={processImages} />

      {/* Çok Satanlar */}
      {bestsellers.length > 0 && (
        <section className="py-10 md:py-14 lg:py-20 bg-white">
          <Container size="content">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-honey-medium text-white text-fluid-lg font-bold px-4 py-2 pr-8 rounded">
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
            <ProductCarousel products={bestsellers} />
          </Container>
        </section>
      )}

      {/* Hikayemiz */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] 3xl:min-h-[600px] flex items-center">
        <Image
          src={hikayemizImage}
          alt="Hikayemiz arkaplan"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="relative w-full py-16 md:py-24">
          <Container size="wide">
            <div className="max-w-lg">
              <h2 className="text-white font-black text-fluid-2xl mb-2">{homeBannersTheme.hikayemiz.heading}</h2>
              <p className="text-honey-bright font-bold text-fluid-lg mb-4">{homeBannersTheme.hikayemiz.subheading}</p>
              <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {homeBannersTheme.hikayemiz.body}
              </p>
              <Link href={homeBannersTheme.hikayemiz.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
                {homeBannersTheme.hikayemiz.btn.label}
              </Link>
            </div>
          </Container>
        </div>
      </section>

      {/* Avantajlı Ürünler */}
      {featured.length > 0 && (
        <section className="py-10 md:py-14 lg:py-20 bg-gray-50">
          <Container size="content">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <span className="bg-honey-medium text-white text-fluid-lg font-bold px-4 py-2 pr-8 rounded">
                AVANTAJLI ÜRÜNLER
              </span>
              <Link
                href="/urunlerimiz?filtre=avantajli"
                className="text-sm text-honey-dark font-semibold hover:underline"
              >
                Tümünü Gör →
              </Link>
            </div>
            <ProductCarousel products={featured} />
          </Container>
        </section>
      )}

      {/* Hakkımızda banner */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] 3xl:min-h-[600px] flex items-center">
        <Image
          src={hakkimizdaImage}
          alt="Hakkımızda arkaplan"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="relative w-full py-16 md:py-24">
          <Container size="wide" className="flex justify-end">
            <div className="max-w-lg">
              <h2 className="text-white font-black text-fluid-2xl mb-2">{homeBannersTheme.hakkimizda.heading}</h2>
              <p className="text-honey-bright font-bold text-fluid-lg mb-4">{homeBannersTheme.hakkimizda.subheading}</p>
              <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {homeBannersTheme.hakkimizda.body}
              </p>
              <Link href={homeBannersTheme.hakkimizda.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
                {homeBannersTheme.hakkimizda.btn.label}
              </Link>
            </div>
          </Container>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
