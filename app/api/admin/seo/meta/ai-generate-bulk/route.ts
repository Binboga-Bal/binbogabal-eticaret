import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/seo/ai/client";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  if (!isAiEnabled()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 503 });
  }

  const { entityType = "product", locale = "tr", mode = "meta", limit = 50 } = await req.json();

  let entityIds: string[] = [];

  if (entityType === "product") {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true },
      take: Math.min(limit, 200),
    });
    entityIds = products.map((p) => p.id);
  } else if (entityType === "blog") {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { id: true },
      take: Math.min(limit, 200),
    });
    entityIds = posts.map((p) => p.id);
  }

  // Zaten optimize edilmişleri filtrele
  const existing = await prisma.seoMeta.findMany({
    where: { entityType, entityId: { in: entityIds }, locale },
    select: { entityId: true },
  });
  const existingIds = new Set(existing.map((e) => e.entityId));
  const toProcess = entityIds.filter((id) => !existingIds.has(id));

  // AiSeoJob kuyruğuna al
  const jobs = await prisma.aiSeoJob.createMany({
    data: toProcess.map((entityId) => ({
      jobType: mode === "full" ? "llm_optimize" : "meta_generate",
      entityType,
      entityId,
      locale,
      status: "PENDING",
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    queued: jobs.count,
    skipped: entityIds.length - toProcess.length,
    total: entityIds.length,
  });
}
