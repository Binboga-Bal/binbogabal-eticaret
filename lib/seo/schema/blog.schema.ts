const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

interface BlogPostForSchema {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
}

export function buildArticleSchema(post: BlogPostForSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ?? undefined,
    url: `${BASE_URL}/bal-rehberi/${post.slug}`,
    datePublished: post.publishedAt?.toISOString() ?? undefined,
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
      url: BASE_URL,
    },
  };
}
