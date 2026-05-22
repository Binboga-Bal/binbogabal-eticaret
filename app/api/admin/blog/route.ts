import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSlug } from "@/lib/utils/slug";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  coverImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

async function checkAdmin() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return null;
  }
  return session;
}

export async function POST(req: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { title, excerpt, content, coverImage, isPublished, metaTitle, metaDescription } = parsed.data;
  const slug = parsed.data.slug || createSlug(title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: excerpt ?? null,
      content,
      coverImage: coverImage ?? null,
      authorId: session.user.id ?? null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
    },
  });

  return NextResponse.json(post);
}
