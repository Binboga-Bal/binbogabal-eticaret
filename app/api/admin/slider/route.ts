import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "media", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { imageUrl, linkUrl, altText } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl zorunlu" }, { status: 400 });

  const maxOrder = await prisma.heroSlide.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const slide = await prisma.heroSlide.create({
    data: { imageUrl, linkUrl: linkUrl || null, altText: altText || null, sortOrder: nextOrder },
  });

  revalidatePath("/");
  return NextResponse.json(slide, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "media", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  // Toplu sıra güncelleme: [{ id, sortOrder }]
  const items: { id: string; sortOrder: number }[] = await req.json();

  await Promise.all(
    items.map(({ id, sortOrder }) =>
      prisma.heroSlide.update({ where: { id }, data: { sortOrder } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
