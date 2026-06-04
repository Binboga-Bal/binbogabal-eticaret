export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { ChevronLeft } from "lucide-react";
import { buildMetadata } from "@/lib/seo/meta.service";
import { buildArticleSchema } from "@/lib/seo/schema/blog.schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Bulunamadı" };
  return buildMetadata("blog", post.id, {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    image: post.coverImage,
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/bal-rehberi/${slug}`,
  });
}


export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
  });

  if (!post) notFound();

  const articleSchema = buildArticleSchema(post);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link
        href="/bal-rehberi"
        className="inline-flex items-center gap-1 text-sm text-honey-dark font-medium hover:underline mb-6"
      >
        <ChevronLeft size={16} /> Bal Rehberi
      </Link>

      {post.coverImage && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <span className="bg-honey-bright text-gray-800 text-xs font-bold px-3 py-1 rounded">
          BAL REHBERİ
        </span>
        <span className="text-sm text-honey-dark font-semibold">Binboğa Kooperatif Balı</span>
        {post.publishedAt && (
          <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
        )}
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-8">{post.title}</h1>

      <div
        className="prose prose-sm max-w-none text-gray-700 prose-headings:text-honey-dark prose-headings:font-bold prose-a:text-honey-dark"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-10 pt-8 border-t">
        <Link
          href="/urunlerimiz"
          className="btn-primary inline-flex"
        >
          Ürünlerimizi İncele
        </Link>
      </div>
    </article>
  );
}
