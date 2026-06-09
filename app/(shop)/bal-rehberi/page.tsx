import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { balRehberiTheme } from "@/lib/theme";
import { buildMetadata } from "@/lib/seo/meta.service";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page", "bal-rehberi", {
    title: "Bal Rehberi | Binboğa Kooperatif Balı",
    description: "Bal hakkında her şey. Gerçek bal nasıl anlaşılır, çocuklar için bal, bal saklama.",
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/bal-rehberi`,
  });
}

export const dynamic = "force-dynamic";

const D = {
  hero_text1: "Her Damlasında Doğanın Binlerce Emeği Saklı...",
  hero_text2: "Binlerce Arının, Binlerce Arıcının, Binlerce Çiçeğin Özü...",
  guvence_heading: "Bal Bilgisi, Kooperatif Güvencesiyle",
  guvence_text:
    "1973'ten beri kooperatif çatısı altında biriken binlerce arıcı, bilimsel analizler ve şeffaf üretim modelimizle bal konusundaki uzmanlığımızı sizlerle paylaşıyoruz.",
  cta_heading: "Rehberden Sofraya: Size Uygun Balı Keşfedin",
  cta_text: "Bal Rehberi'nde edindiğiniz bilgiyle ürünlerimize göz atın ve sağlıklı alışveriş yapın.",
  cta_btn_1: "Ürünleri İncele",
  cta_btn_2: "Kooperatif Hikayesi",
} as const;

const PFX = "page_balrehberi_";
const ALL_KEYS = [
  ...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`),
  "banner_bal_rehberi",
  "img_bal_rehberi_guvence",
];

function t(db: Record<string, string>, key: keyof typeof D): string {
  return db[`${PFX}${key}`] || D[key];
}

export default async function HoneyGuidePage() {
  const [posts, settingRows] = await Promise.all([
    prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } }),
    prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } }),
  ]);

  const db = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));
  const bannerImage = db.banner_bal_rehberi ?? balRehberiTheme.banner.image;
  const guvenceImage = db.img_bal_rehberi_guvence ?? "/images/bal-rehberi/bal-rehberi-kooperatif-guvencesi.jpg";

  return (
    <div>
      {/* Hero */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-end text-center text-white px-4 pb-20 h-[30rem] md:h-[32rem] xl:h-[36rem] 2xl:h-[38rem] 3xl:h-[42rem] 4xl:h-[48rem] bg-honey-cream"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: balRehberiTheme.banner.objectPosition,
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black" style={{ opacity: balRehberiTheme.banner.overlayOpacity }} />
        <div className="relative">
          <p className="text-3xl font-black text-gray-900">{t(db, "hero_text1")}</p>
          <p className="text-lg font-semibold text-gray-800 mt-2">{t(db, "hero_text2")}</p>
        </div>
      </div>

      {/* Makaleler */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className={`group flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden border border-gray-100 hover:border-honey-light hover:shadow-md transition-all duration-300 bg-white ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <Link href={`/bal-rehberi/${post.slug}`} className="block md:w-2/5 flex-shrink-0">
                <div className="h-56 md:h-full min-h-[220px] bg-honey-cream overflow-hidden">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🍯</div>
                  )}
                </div>
              </Link>
              <div className="flex flex-col justify-center p-7 md:p-10 flex-1 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-honey-dark uppercase tracking-widest">Bal Rehberi</span>
                  {post.publishedAt && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
                    </>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug mb-3">
                  <Link href={`/bal-rehberi/${post.slug}`} className="hover:text-honey-dark transition-colors">{post.title}</Link>
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
                <Link href={`/bal-rehberi/${post.slug}`} className="self-start inline-flex items-center gap-2 text-sm font-bold text-honey-dark border-b-2 border-honey-bright pb-0.5 hover:text-honey-medium hover:border-honey-medium transition-colors">
                  Konunun Devamını Oku →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐝</div>
            <p className="text-gray-400">Henüz içerik eklenmedi. Yakında burada bal rehberi yazıları olacak.</p>
          </div>
        )}
      </div>

      {/* Güvence Banner */}
      <div className={`relative overflow-hidden bg-honey-dark ${balRehberiTheme.guvenceBolumu.paddingY} px-4 text-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={guvenceImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: balRehberiTheme.guvenceBolumu.imageOpacity }} />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t(db, "guvence_heading")}</h2>
          <p className="text-white/80 text-sm max-w-xl mx-auto">{t(db, "guvence_text")}</p>
        </div>
      </div>

      {/* Popüler Rehberler + CTA */}
      {posts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Popüler Rehberler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {posts.slice(0, 4).map((post) => (
              <Link key={post.id} href={`/bal-rehberi/${post.slug}`} className="group flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:border-honey-bright hover:shadow-md transition-all duration-300 bg-white">
                <div className="w-full aspect-square bg-honey-cream overflow-hidden">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍯</div>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-honey-dark transition-colors line-clamp-2 leading-snug">{post.title}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl bg-honey-cream border border-honey-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-900 text-base">{t(db, "cta_heading")}</p>
              <p className="text-sm text-gray-600 mt-1">{t(db, "cta_text")}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/urunlerimiz" className="inline-flex items-center gap-2 bg-honey-dark text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey-medium transition-colors">
                {t(db, "cta_btn_1")}
              </Link>
              <Link href="/kooperatif-hikayemiz" className="inline-flex items-center gap-2 border border-honey-dark text-honey-dark font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey-dark hover:text-white transition-colors">
                {t(db, "cta_btn_2")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
