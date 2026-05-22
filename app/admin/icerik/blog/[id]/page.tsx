import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostEditor from "./BlogPostEditor";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "yeni") return { title: "Yeni Blog Yazısı | Admin" };
  const post = await prisma.blogPost.findUnique({ where: { id } });
  return { title: post ? `${post.title} | Admin` : "Blog Yazısı | Admin" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "yeni") {
    return <BlogPostEditor post={null} />;
  }

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const serialized = {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  return <BlogPostEditor post={serialized} />;
}
