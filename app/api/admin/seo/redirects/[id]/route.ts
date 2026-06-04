import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { clearRedirectCache } from "@/lib/seo/redirect.service";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  if (body.fromPath?.includes("..") || body.toPath?.includes("..")) {
    return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
  }

  const redirect = await prisma.redirect.update({ where: { id }, data: body });
  clearRedirectCache();
  return NextResponse.json(redirect);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  await prisma.redirect.delete({ where: { id } });
  clearRedirectCache();
  return NextResponse.json({ success: true });
}
