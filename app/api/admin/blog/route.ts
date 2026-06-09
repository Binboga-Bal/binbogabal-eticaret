import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSlug } from "@/lib/utils/slug";
import { logAction } from "@/lib/audit/logger";

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

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "content", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

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
      authorId: session.adminId,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
    },
  });

  await logAction({ adminId: session.adminId, action: "create", module: "blog", targetId: post.id, targetLabel: post.title, newData: { id: post.id, title, slug, isPublished }, req });

  return NextResponse.json(post);
}
