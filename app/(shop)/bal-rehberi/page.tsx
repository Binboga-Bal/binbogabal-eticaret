import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { balRehberiTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Bal Rehberi",
  description:
    "Bal hakkında her şey. Gerçek bal nasıl anlaşılır, çocuklar için bal, bal saklama.",
};

// Force dynamic so the DB isn't queried at build time
export const dynamic = "force-dynamic";

export default async function HoneyGuidePage() {
  const [posts, bannerSetting, guvenceSetting] = await Promise.all([
    prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } }),
    prisma.siteSetting.findUnique({ where: { key: "banner_bal_rehberi" } }),
    prisma.siteSetting.findUnique({ where: { key: "img_bal_rehberi_guvence" } }),
  ]);

  const bannerImage = bannerSetting?.value ?? balRehberiTheme.banner.image;
  const guvenceImage = guvenceSetting?.value ?? "/images/bal-rehberi/bal-rehberi-kooperatif-guvencesi.jpg";

  return (
    <div>
      {/* Hero */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-end text-center text-white px-4 pb-20"
        style={{
          height: balRehberiTheme.banner.height,
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: balRehberiTheme.banner.objectPosition,
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: balRehberiTheme.banner.overlayOpacity }}
        />
        <div className="relative">
          <p className="text-3xl font-black text-gray-900">
            Her Damlasında Doğanın Binlerce Emeği Saklı...
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-2">
            Binlerce Arının, Binlerce Arıcının, Binlerce Çiçeğin Özü...
          </p>
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
              {/* Görsel */}
              <Link href={`/bal-rehberi/${post.slug}`} className="block md:w-2/5 flex-shrink-0">
                <div className="h-56 md:h-full min-h-[220px] bg-honey-cream overflow-hidden">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🍯</div>
                  )}
                </div>
              </Link>

              {/* Metin */}
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
                  <Link href={`/bal-rehberi/${post.slug}`} className="hover:text-honey-dark transition-colors">
                    {post.title}
                  </Link>
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                  {post.excerpt}
                </p>

                <Link
                  href={`/bal-rehberi/${post.slug}`}
                  className="self-start inline-flex items-center gap-2 text-sm font-bold text-honey-dark border-b-2 border-honey-bright pb-0.5 hover:text-honey-medium hover:border-honey-medium transition-colors"
                >
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

      {/* Bilgi Banner */}
      <div className={`relative overflow-hidden bg-honey-dark ${balRehberiTheme.guvenceBolumu.paddingY} px-4 text-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={guvenceImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: balRehberiTheme.guvenceBolumu.imageOpacity }}
        />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Bal Bilgisi, Kooperatif Güvencesiyle
          </h2>
          <p className="text-white/80 text-sm max-w-xl mx-auto">
            1973&apos;ten beri kooperatif çatısı altında biriken binlerce arıcı, bilimsel analizler ve şeffaf üretim modelimizle bal konusundaki uzmanlığımızı sizlerle paylaşıyoruz.
          </p>
        </div>
      </div>

      {/* Popüler Rehberler */}
      {posts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Popüler Rehberler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {posts.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                href={`/bal-rehberi/${post.slug}`}
                className="group flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:border-honey-bright hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="w-full aspect-square bg-honey-cream overflow-hidden">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍯</div>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-honey-dark transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-honey-cream border border-honey-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-900 text-base">Rehberden Sofraya: Size Uygun Balı Keşfedin</p>
              <p className="text-sm text-gray-600 mt-1">
                Bal Rehberi&apos;nde edindiğiniz bilgiyle ürünlerimize göz atın ve sağlıklı alışveriş yapın.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/urunlerimiz"
                className="inline-flex items-center gap-2 bg-honey-dark text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey-medium transition-colors"
              >
                Ürünleri İncele
              </Link>
              <Link
                href="/kooperatif-hikayemiz"
                className="inline-flex items-center gap-2 border border-honey-dark text-honey-dark font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-honey-dark hover:text-white transition-colors"
              >
                Kooperatif Hikayesi
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
