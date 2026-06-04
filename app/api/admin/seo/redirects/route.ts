import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { clearRedirectCache } from "@/lib/seo/redirect.service";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const isActive = searchParams.get("isActive");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  const where = {
    ...(q ? { fromPath: { contains: q, mode: "insensitive" as const } } : {}),
    ...(isActive !== null ? { isActive: isActive === "true" } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.redirect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.redirect.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const { fromPath, toPath, statusCode = 301, locale, note } = body;

  if (!fromPath || !toPath) {
    return NextResponse.json({ error: "fromPath ve toPath zorunlu" }, { status: 400 });
  }

  // Kendine yönlendirme kontrolü
  if (fromPath === toPath) {
    return NextResponse.json({ error: "Kaynak ve hedef aynı olamaz" }, { status: 400 });
  }

  // Path traversal koruması
  if (fromPath.includes("..") || toPath.includes("..")) {
    return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
  }

  const redirect = await prisma.redirect.create({
    data: { fromPath, toPath, statusCode, locale, note, createdBy: session.adminId },
  });

  clearRedirectCache();
  return NextResponse.json(redirect, { status: 201 });
}
