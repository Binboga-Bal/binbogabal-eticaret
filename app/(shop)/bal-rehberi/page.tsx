import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Bal Rehberi",
  description: "Bal hakkında her şey. Gerçek bal nasıl anlaşılır, çocuklar için bal, bal saklama.",
};

// Force dynamic so the DB isn't queried at build time
export const dynamic = "force-dynamic";

export default async function HoneyGuidePage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-honey-dark flex flex-col items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-honey-bright"
              style={{
                width: 40 + (i * 13) % 60,
                height: 40 + (i * 13) % 60,
                top: `${(i * 30) % 100}%`,
                left: `${(i * 23) % 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative">
          <p className="text-honey-bright font-bold text-sm mb-2 uppercase tracking-widest">Bal Rehberi</p>
          <p className="text-lg text-white/80">Her Damlasında Doğanın Binlerce Emeği Saklı...</p>
          <p className="text-sm text-white/60 mt-1">Binlerce Arının, Binlerce Arıcının, Binlerce Çiçeğin Özü...</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xl">🐝</span>
          <span className="text-sm font-medium text-gray-600">Bal ve sağlık hakkında merak ettiğiniz her şey</span>
        </div>

        <div className="space-y-10">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:grid-flow-col-dense" : ""}`}
            >
              <div className={i % 2 === 1 ? "md:col-start-2" : ""}>
                <Link href={`/bal-rehberi/${post.slug}`} className="group block">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-honey-cream flex items-center justify-center">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl">🍯</span>
                    )}
                  </div>
                </Link>
              </div>

              <div className={i % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""}>
                <Link href={`/bal-rehberi/${post.slug}`} className="group">
                  <h2 className="text-xl font-black text-gray-900 group-hover:text-honey-dark transition-colors mb-1 bg-honey-bright inline-block px-2 py-0.5 rounded">
                    {post.title.toUpperCase()}
                  </h2>
                  <p className="text-sm text-honey-dark font-medium mt-2">{post.title}</p>
                </Link>

                {post.publishedAt && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(post.publishedAt)}</p>
                )}

                <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-4">{post.excerpt}</p>

                <div className="mt-4">
                  <Link
                    href={`/bal-rehberi/${post.slug}`}
                    className="inline-flex items-center gap-2 bg-honey-bright text-gray-800 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-honey-medium hover:text-white transition-colors"
                  >
                    KONUNUN DEVAMI ▶
                  </Link>
                </div>
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
    </div>
  );
}
