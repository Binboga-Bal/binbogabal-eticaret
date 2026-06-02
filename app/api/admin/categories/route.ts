import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "categories", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const categories = await prisma.category.findMany({
    where: q ? { name: { contains: q } } : undefined,
    select: { id: true, name: true, image: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "categories", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { name, slug, description, isActive, image } = await req.json();

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, slug, description: description || null, isActive, image: image || null },
  });

  return NextResponse.json(category);
}
