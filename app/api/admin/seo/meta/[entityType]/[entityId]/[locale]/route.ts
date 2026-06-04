import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { calculateSeoScore, calculateLlmScore } from "@/lib/seo/score-calculator";

type Params = { params: Promise<{ entityType: string; entityId: string; locale: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { entityType, entityId, locale } = await params;
  const record = await prisma.seoMeta.findUnique({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
  });

  if (!record) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { entityType, entityId, locale } = await params;
  const body = await req.json();

  // Otomatik skor hesapla
  const seoScore = calculateSeoScore({
    title: body.title,
    description: body.description,
    keywords: body.keywords,
    canonicalUrl: body.canonicalUrl,
    ogTitle: body.ogTitle,
    ogDescription: body.ogDescription,
    ogImage: body.ogImage,
    schemaMarkup: body.schemaMarkup,
    noIndex: body.noIndex,
  });

  const llmScore = calculateLlmScore({
    llmSummary: body.llmSummary,
    llmKeyFacts: body.llmKeyFacts,
    llmQaPairs: body.llmQaPairs,
    schemaMarkup: body.schemaMarkup,
    llmBotsAllowed: true,
    recentlyUpdated: true,
  });

  const record = await prisma.seoMeta.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
    create: {
      entityType,
      entityId,
      locale,
      ...body,
      seoScore,
      llmScore,
      lastAuditedAt: new Date(),
    },
    update: {
      ...body,
      seoScore,
      llmScore,
      lastAuditedAt: new Date(),
    },
  });

  return NextResponse.json(record);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { entityType, entityId, locale } = await params;
  await prisma.seoMeta.deleteMany({ where: { entityType, entityId, locale } });
  return NextResponse.json({ success: true });
}
