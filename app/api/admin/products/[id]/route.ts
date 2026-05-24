import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { HoneyType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { variants, ...productData } = body;

  try {
    // Mevcut varyantları kaldır, yenileri ekle
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: productData.name,
        slug: productData.slug,
        shortDescription: productData.shortDescription || null,
        description: productData.description || null,
        images: Array.isArray(productData.images) ? productData.images : undefined,
        categoryId: productData.categoryId || null,
        honeyType: productData.honeyType ? (productData.honeyType as HoneyType) : null,
        isActive: productData.isActive,
        isBestseller: productData.isBestseller,
        isFeatured: productData.isFeatured,
        isNew: productData.isNew,
        variants: {
          create: variants.map((v: { erpVariantCode?: string | null; size: number; packagingType: string; price: number; discountedPrice: number | null; stock: number; sku: string }) => ({
            erpVariantCode: v.erpVariantCode ?? null,
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

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
