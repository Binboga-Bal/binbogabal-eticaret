import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") ?? undefined;
  const locale = searchParams.get("locale") ?? "tr";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");
  const q = searchParams.get("q") ?? "";

  const where = {
    ...(entityType ? { entityType } : {}),
    locale,
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.seoMeta.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.seoMeta.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const { entityType, entityId, locale = "tr", ...data } = body;

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType ve entityId zorunlu" }, { status: 400 });
  }

  const record = await prisma.seoMeta.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
    create: { entityType, entityId, locale, ...data },
    update: data,
  });

  return NextResponse.json(record);
}
