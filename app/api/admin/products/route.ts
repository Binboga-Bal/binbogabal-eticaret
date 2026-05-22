import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils/slug";
import type { HoneyType } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { variants, ...productData } = body;

  try {
    // Slug benzersizliği
    let slug = productData.slug || createSlug(productData.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug,
        shortDescription: productData.shortDescription || null,
        description: productData.description || null,
        images: Array.isArray(productData.images) ? productData.images : [],
        categoryId: productData.categoryId || null,
        honeyType: productData.honeyType ? (productData.honeyType as HoneyType) : null,
        isActive: productData.isActive ?? true,
        isBestseller: productData.isBestseller ?? false,
        isFeatured: productData.isFeatured ?? false,
        isNew: productData.isNew ?? false,
        variants: {
          create: variants.map((v: { size: number; packagingType: string; price: number; discountedPrice: number | null; stock: number; sku: string }) => ({
            size: v.size,
            packagingType: v.packagingType,
            price: v.price,
            discountedPrice: v.discountedPrice,
            stock: v.stock,
            sku: v.sku || null,
          })),
        },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
