import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { variants, ...productData } = body;

  try {
    type VariantInput = { id?: string; erpVariantCode?: string | null; size: number; packagingType: string; price: number; discountedPrice: number | null; stock: number; sku: string; maxOrderQuantity?: number | null };
    const existingVariants = variants.filter((v: VariantInput) => v.id);
    const newVariants = variants.filter((v: VariantInput) => !v.id);
    const keptIds = existingVariants.map((v: VariantInput) => v.id as string);

    // Delete only variants not in the incoming list AND with no order items
    const currentVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true, _count: { select: { orderItems: true } } },
    });
    const deletableIds = currentVariants
      .filter((v) => !keptIds.includes(v.id) && v._count.orderItems === 0)
      .map((v) => v.id);
    if (deletableIds.length > 0) {
      await prisma.productVariant.deleteMany({ where: { id: { in: deletableIds } } });
    }

    // Update existing variants
    await Promise.all(
      existingVariants.map((v: VariantInput) =>
        prisma.productVariant.update({
          where: { id: v.id },
          data: {
            erpVariantCode: v.erpVariantCode ?? null,
            size: v.size,
            packagingType: v.packagingType,
            price: v.price,
            discountedPrice: v.discountedPrice,
            stock: v.stock,
            sku: v.sku || null,
            maxOrderQuantity: v.maxOrderQuantity ?? null,
          },
        })
      )
    );

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: productData.name,
        slug: productData.slug,
        shortDescription: productData.shortDescription || null,
        description: productData.description || null,
        images: Array.isArray(productData.images) ? productData.images : undefined,
        categories: {
          set: (productData.categoryIds ?? []).map((id: string) => ({ id })),
        },
        honeyTypes: {
          set: (productData.honeyTypeIds ?? []).map((id: string) => ({ id })),
        },
        isActive: productData.isActive,
        isBestseller: productData.isBestseller,
        isFeatured: productData.isFeatured,
        isNew: productData.isNew,
        tasteNotes: Array.isArray(productData.tasteNotes) ? productData.tasteNotes.filter(Boolean) : [],
        usageSuggestions: Array.isArray(productData.usageSuggestions) ? productData.usageSuggestions : [],
        relatedProductIds: Array.isArray(productData.relatedProductIds) ? productData.relatedProductIds : [],
        analysisReportUrl: productData.analysisReportUrl ?? null,
        variants: {
          create: newVariants.map((v: VariantInput) => ({
            erpVariantCode: v.erpVariantCode ?? null,
            size: v.size,
            packagingType: v.packagingType,
            price: v.price,
            discountedPrice: v.discountedPrice,
            stock: v.stock,
            sku: v.sku || null,
            maxOrderQuantity: v.maxOrderQuantity ?? null,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/urunlerimiz");
    revalidatePath("/urunlerimiz/[slug]", "page");

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });

  revalidatePath("/");
  revalidatePath("/urunlerimiz");
  revalidatePath("/urunlerimiz/[slug]", "page");

  return NextResponse.json({ success: true });
}
