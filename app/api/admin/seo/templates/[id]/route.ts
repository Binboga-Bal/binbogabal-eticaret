import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  if (body.isDefault) {
    const existing = await prisma.seoTemplate.findUnique({ where: { id } });
    if (existing) {
      await prisma.seoTemplate.updateMany({
        where: { entityType: existing.entityType, locale: existing.locale, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
  }

  const template = await prisma.seoTemplate.update({ where: { id }, data: body });
  return NextResponse.json(template);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  await prisma.seoTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
