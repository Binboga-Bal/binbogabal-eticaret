import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { STATIC_PAGES } from "@/lib/seo/static-pages";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!(await can(session.adminId, "seo", "edit")))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const existing = await prisma.seoMeta.findMany({
    where: { entityType: "page", locale: "tr" },
    select: { entityId: true },
  });
  const existingIds = new Set(existing.map((e) => e.entityId));

  const toCreate = STATIC_PAGES.filter((p) => !existingIds.has(p.id));

  if (toCreate.length === 0) {
    return NextResponse.json({ created: 0, message: "Tüm sayfalar zaten tanımlı" });
  }

  await prisma.seoMeta.createMany({
    data: toCreate.map((page) => ({
      entityType: "page",
      entityId: page.id,
      locale: "tr",
      title: page.defaultTitle,
      description: page.defaultDescription,
      canonicalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${page.path}`,
      noIndex: false,
      noFollow: false,
    })),
  });

  return NextResponse.json({ created: toCreate.length });
}
