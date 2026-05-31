import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VARIANT_SELECT = {
  where: { isActive: true, stock: { gt: 0 } },
  orderBy: { price: "asc" } as const,
  take: 1,
  select: {
    id: true,
    size: true,
    packagingType: true,
    price: true,
    discountedPrice: true,
  },
};

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  images: true,
  variants: VARIANT_SELECT,
};

export async function GET() {
  const rules = await prisma.volumeDiscount.findMany({
    where: { isActive: true },
    include: {
      products: {
        include: { product: { select: PRODUCT_SELECT } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Belirli ürün seçilmemiş kurallar için öne çıkan ürünleri ekle
  const needsFallback = rules.some((r) => r.products.length === 0);
  const fallbackProducts = needsFallback
    ? await prisma.product.findMany({
        where: { isActive: true, variants: { some: { isActive: true, stock: { gt: 0 } } } },
        select: PRODUCT_SELECT,
        orderBy: [{ isBestseller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
      })
    : [];

  const response = rules.map((rule) => ({
    ...rule,
    // Kural "tüm ürünler" modundaysa fallback listesini kullan
    suggestedProducts: rule.products.length === 0 ? fallbackProducts : [],
  }));

  return NextResponse.json(response);
}
