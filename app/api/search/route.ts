import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  images: true,
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" as const },
    take: 1,
    select: { price: true, discountedPrice: true },
  },
};

function serialize(products: Awaited<ReturnType<typeof prisma.product.findMany>>) {
  return products.map((p) => ({
    ...(p as typeof productSelect & typeof p),
    variants: (p.variants as { price: unknown; discountedPrice: unknown }[]).map((v) => ({
      price: Number(v.price),
      discountedPrice: v.discountedPrice !== null ? Number(v.discountedPrice) : null,
    })),
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const popular = await prisma.product.findMany({
    where: { isActive: true, isBestseller: true },
    take: 6,
    select: productSelect,
  });

  if (!q) {
    return NextResponse.json({ results: [], popular: serialize(popular) });
  }

  /*
    Arama kapsamı:
      - name             → ürün başlığı
      - shortDescription → kısa açıklama (uzun description kasıtlı dışarıda —
                           ambalaj bilgileri içeriyor, "çam" araması "cam kavanoz"a vurmasın)
      - honeyTypes.label → bal türü etiketi  (ör. "Çiçek Balı", "Kestane")
      - categories.name  → kategori adı      (ör. "Süzme Bal", "Organik")
  */
  const results = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name:             { contains: q } },
        { shortDescription: { contains: q } },
        { honeyTypes: { some: { label: { contains: q }, isActive: true } } },
        { categories: { some: { name:  { contains: q }, isActive: true } } },
      ],
    },
    take: 12,
    select: productSelect,
    orderBy: [
      { isBestseller: "desc" },
      { isFeatured:   "desc" },
    ],
  });

  return NextResponse.json({ results: serialize(results), popular: serialize(popular) });
}
