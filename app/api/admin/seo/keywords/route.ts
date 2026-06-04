import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "tr";
  const country = searchParams.get("country") ?? "TR";
  const isActive = searchParams.get("isActive");

  const keywords = await prisma.keywordTracking.findMany({
    where: {
      locale,
      country,
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    },
    include: {
      rankings: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keywords);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { keyword, locale = "tr", country = "TR", targetUrl } = await req.json();
  if (!keyword) return NextResponse.json({ error: "Anahtar kelime zorunlu" }, { status: 400 });

  const record = await prisma.keywordTracking.upsert({
    where: { keyword_locale_country: { keyword, locale, country } },
    create: { keyword, locale, country, targetUrl, isActive: true },
    update: { isActive: true, targetUrl },
  });

  return NextResponse.json(record, { status: 201 });
}
