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
  const locale = searchParams.get("locale") ?? undefined;

  const templates = await prisma.seoTemplate.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(locale ? { locale } : {}),
    },
    orderBy: [{ entityType: "asc" }, { locale: "asc" }],
  });

  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const { name, entityType, locale, titlePattern, descPattern, isDefault } = body;

  if (!name || !entityType || !locale || !titlePattern || !descPattern) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  // isDefault true ise aynı entityType+locale için diğerlerini false yap
  if (isDefault) {
    await prisma.seoTemplate.updateMany({
      where: { entityType, locale, isDefault: true },
      data: { isDefault: false },
    });
  }

  const template = await prisma.seoTemplate.create({
    data: { name, entityType, locale, titlePattern, descPattern, isDefault: isDefault ?? false, createdBy: session.adminId },
  });

  return NextResponse.json(template);
}
