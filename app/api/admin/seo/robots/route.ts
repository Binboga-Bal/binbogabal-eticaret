import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const config = await prisma.robotsConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(config ?? { content: null });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "edit")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "İçerik zorunlu" }, { status: 400 });

  // Mevcut aktif config'i devre dışı bırak
  await prisma.robotsConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });

  const config = await prisma.robotsConfig.create({
    data: { content, isActive: true, updatedBy: session.adminId },
  });

  return NextResponse.json(config);
}
