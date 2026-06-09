import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

const MAX_IMAGES = 3;

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/urunlerimiz");
  revalidatePath("/urunlerimiz/[slug]", "page");
}

// GET — list images that appear in 2+ products
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "view"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const products = await prisma.product.findMany({ select: { images: true } });

  const counts = new Map<string, number>();
  for (const { images: raw } of products) {
    for (const url of parseImages(raw)) {
      if (url) counts.set(url, (counts.get(url) ?? 0) + 1);
    }
  }

  const common = Array.from(counts.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([url, count]) => ({ url, count }));

  return NextResponse.json({ images: common });
}

// POST — add image to all products at a specific position
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { imageUrl, position } = await req.json() as { imageUrl: string; position: number };

  if (!imageUrl || typeof imageUrl !== "string")
    return NextResponse.json({ error: "Geçersiz görsel URL." }, { status: 400 });

  const pos = Number(position);
  if (!Number.isInteger(pos) || pos < 1 || pos > MAX_IMAGES)
    return NextResponse.json({ error: "Sıra 1-3 arasında olmalıdır." }, { status: 400 });

  const products = await prisma.product.findMany({ select: { id: true, images: true } });

  let exact = 0;
  let adjusted = 0;

  const updates = products.map(({ id, images: raw }) => {
    const base = parseImages(raw).filter((u) => u !== imageUrl);
    const next = [...base];

    if (base.length >= pos - 1) {
      next.splice(pos - 1, 0, imageUrl);
      exact++;
    } else {
      next.push(imageUrl);
      adjusted++;
    }

    return prisma.product.update({ where: { id }, data: { images: next.slice(0, MAX_IMAGES) } });
  });

  await prisma.$transaction(updates);
  revalidateAll();

  return NextResponse.json({ updated: products.length, exact, adjusted });
}

// PUT — replace an existing shared image URL across all products
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { oldUrl, newUrl } = await req.json() as { oldUrl: string; newUrl: string };

  if (!oldUrl || !newUrl)
    return NextResponse.json({ error: "Geçersiz parametreler." }, { status: 400 });

  const products = await prisma.product.findMany({ select: { id: true, images: true } });
  const toUpdate = products.filter(({ images: raw }) => parseImages(raw).includes(oldUrl));

  await prisma.$transaction(
    toUpdate.map(({ id, images: raw }) =>
      prisma.product.update({
        where: { id },
        data: { images: parseImages(raw).map((u) => (u === oldUrl ? newUrl : u)) },
      })
    )
  );

  revalidateAll();
  return NextResponse.json({ updated: toUpdate.length });
}

// DELETE — remove an image from all products
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { imageUrl } = await req.json() as { imageUrl: string };

  if (!imageUrl)
    return NextResponse.json({ error: "Geçersiz görsel URL." }, { status: 400 });

  const products = await prisma.product.findMany({ select: { id: true, images: true } });
  const toUpdate = products.filter(({ images: raw }) => parseImages(raw).includes(imageUrl));

  await prisma.$transaction(
    toUpdate.map(({ id, images: raw }) =>
      prisma.product.update({
        where: { id },
        data: { images: parseImages(raw).filter((u) => u !== imageUrl) },
      })
    )
  );

  revalidateAll();
  return NextResponse.json({ removed: toUpdate.length });
}
