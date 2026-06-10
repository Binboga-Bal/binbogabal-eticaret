import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/meta.service";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schema/organization.schema";
import { buildLocalBusinessSchema } from "@/lib/seo/schema/local-business.schema";
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

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page", "home", {
    title: "Kozan'dan Doğal Bal | Binboğa Kooperatif Balı",
    description: "1973'ten bu yana 745 Sayılı Kozan Bal Tarım Satış Kooperatifi. Doğal, analizi yapılmış kooperatif balı.",
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "/",
  });
}

// Katalog içeriği statik üretilir ve ISR ile 5 dk'da bir tazelenir.
// ERP senkronu (app/api/admin/erp) ayrıca on-demand revalidate tetikler.
export const revalidate = 300;

async function getBestsellers() {
  return prisma.product.findMany({
    where: { isActive: true, isBestseller: true, variants: { some: { isActive: true, stock: { gt: 0 } } } },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
    },
    orderBy: { bestsellOrder: "asc" },
    take: 12,
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true, variants: { some: { isActive: true, stock: { gt: 0 } } } },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
    },
    orderBy: { featuredOrder: "asc" },
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

async function getHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, imageUrl: true, linkUrl: true, altText: true },
  });
}

const SETTING_KEYS = [
  "img_home_hikayemiz", "img_home_hakkimizda",
  "img_badge_1", "img_badge_2", "img_badge_3", "img_badge_4",
  "img_process_1", "img_process_2", "img_process_3", "img_process_4",
  "text_home_hikayemiz_heading", "text_home_hikayemiz_subheading",
  "text_home_hikayemiz_body", "text_home_hikayemiz_btn",
  "text_home_hakkimizda_heading", "text_home_hakkimizda_subheading",
  "text_home_hakkimizda_body", "text_home_hakkimizda_btn",
  "text_home_process_heading",
  "text_home_badge_1_title", "text_home_badge_1_desc",
  "text_home_badge_2_title", "text_home_badge_2_desc",
  "text_home_badge_3_title", "text_home_badge_3_desc",
  "text_home_badge_4_title", "text_home_badge_4_desc",
  "text_home_process_1_title", "text_home_process_1_desc",
  "text_home_process_2_title", "text_home_process_2_desc",
  "text_home_process_3_title", "text_home_process_3_desc",
  "text_home_process_4_title", "text_home_process_4_desc",
  "text_home_categories_heading", "text_home_categories_subheading",
];

export default async function HomePage() {
  const [rawBestsellers, rawFeatured, faqs, settingRows, heroSlides] = await Promise.all([
    getBestsellers(),
    getFeaturedProducts(),
    getFaqs(),
    prisma.siteSetting.findMany({ where: { key: { in: SETTING_KEYS } } }),
    getHeroSlides(),
  ]);

  const bestsellers = rawBestsellers.map(serializeProduct);
  const featured = rawFeatured.map(serializeProduct);
  const s = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));

  const badgeImages = [s.img_badge_1, s.img_badge_2, s.img_badge_3, s.img_badge_4];
  const processImages = [s.img_process_1, s.img_process_2, s.img_process_3, s.img_process_4];
  const hikayemizImage = s.img_home_hikayemiz ?? homeBannersTheme.hikayemiz.image;
  const hakkimizdaImage = s.img_home_hakkimizda ?? homeBannersTheme.hakkimizda.image;

  const badgeTexts = [1, 2, 3, 4].map((n) => ({
    title: s[`text_home_badge_${n}_title`] || undefined,
    description: s[`text_home_badge_${n}_desc`] || undefined,
  }));
  const stepTexts = [1, 2, 3, 4].map((n) => ({
    title: s[`text_home_process_${n}_title`] || undefined,
    description: s[`text_home_process_${n}_desc`] || undefined,
  }));

  const hikayemiz = {
    heading:    s.text_home_hikayemiz_heading    || homeBannersTheme.hikayemiz.heading,
    subheading: s.text_home_hikayemiz_subheading || homeBannersTheme.hikayemiz.subheading,
    body:       s.text_home_hikayemiz_body       || homeBannersTheme.hikayemiz.body,
    btnLabel:   s.text_home_hikayemiz_btn        || homeBannersTheme.hikayemiz.btn.label,
  };
  const hakkimizda = {
    heading:    s.text_home_hakkimizda_heading    || homeBannersTheme.hakkimizda.heading,
    subheading: s.text_home_hakkimizda_subheading || homeBannersTheme.hakkimizda.subheading,
    body:       s.text_home_hakkimizda_body       || homeBannersTheme.hakkimizda.body,
    btnLabel:   s.text_home_hakkimizda_btn        || homeBannersTheme.hakkimizda.btn.label,
  };

  return (
    <>
      <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }} />
      <Script id="website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteSchema()) }} />
      <Script id="local-biz-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }} />
      {heroSlides[0] && <link rel="preload" as="image" href={heroSlides[0].imageUrl} />}
      <HeroSlider slides={heroSlides} />
      <TrustBadges images={badgeImages} badgeTexts={badgeTexts} />

      <CategoryGrid
        heading={s.text_home_categories_heading || undefined}
        subheading={s.text_home_categories_subheading || undefined}
      />

      <ProcessFlow
        images={processImages}
        heading={s.text_home_process_heading || undefined}
        stepTexts={stepTexts}
      />

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
              <h2 className="text-white font-black text-fluid-2xl mb-2">{hikayemiz.heading}</h2>
              <p className="text-honey-bright font-bold text-fluid-lg mb-4">{hikayemiz.subheading}</p>
              <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {hikayemiz.body}
              </p>
              <Link href={homeBannersTheme.hikayemiz.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
                {hikayemiz.btnLabel}
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
              <h2 className="text-white font-black text-fluid-2xl mb-2">{hakkimizda.heading}</h2>
              <p className="text-honey-bright font-bold text-fluid-lg mb-4">{hakkimizda.subheading}</p>
              <p className="text-white/90 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {hakkimizda.body}
              </p>
              <Link href={homeBannersTheme.hakkimizda.btn.href} className="btn-secondary text-white inline-flex items-center gap-2 rounded-2xl">
                {hakkimizda.btnLabel}
              </Link>
            </div>
          </Container>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
