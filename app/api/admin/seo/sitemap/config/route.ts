import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIGS = [
  { entityType: "product", changeFreq: "weekly", priority: 0.8 },
  { entityType: "category", changeFreq: "weekly", priority: 0.7 },
  { entityType: "blog", changeFreq: "monthly", priority: 0.6 },
  { entityType: "campaign", changeFreq: "daily", priority: 0.7 },
  { entityType: "page", changeFreq: "monthly", priority: 0.5 },
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const configs = await prisma.sitemapConfig.findMany({ orderBy: { entityType: "asc" } });

  // Default'ları doldur
  const merged = DEFAULT_CONFIGS.map((def) => {
    const existing = configs.find((c) => c.entityType === def.entityType);
    return existing ?? { ...def, id: null, isIncluded: true, includeImages: true, includeLocales: ["tr"] };
  });

  return NextResponse.json(merged);
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const { entityType, ...data } = body;

  if (!entityType) return NextResponse.json({ error: "entityType zorunlu" }, { status: 400 });

  const config = await prisma.sitemapConfig.upsert({
    where: { entityType },
    create: { entityType, ...data },
    update: data,
  });

  return NextResponse.json(config);
}
