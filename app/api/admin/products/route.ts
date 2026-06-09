import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils/slug";
import { logAction } from "@/lib/audit/logger";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    select: { id: true, name: true, images: true },
    orderBy: { name: "asc" },
    take: 60,
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const { variants, ...productData } = body;

  try {
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
        isActive: productData.isActive ?? true,
        isBestseller: productData.isBestseller ?? false,
        isFeatured: productData.isFeatured ?? false,
        isNew: productData.isNew ?? false,
        tasteNotes: Array.isArray(productData.tasteNotes) ? productData.tasteNotes.filter(Boolean) : [],
        usageSuggestions: Array.isArray(productData.usageSuggestions) ? productData.usageSuggestions : [],
        relatedProductIds: Array.isArray(productData.relatedProductIds) ? productData.relatedProductIds : [],
        analysisReportUrl: productData.analysisReportUrl ?? null,
        categories: productData.categoryIds?.length
          ? { connect: productData.categoryIds.map((id: string) => ({ id })) }
          : undefined,
        honeyTypes: productData.honeyTypeIds?.length
          ? { connect: productData.honeyTypeIds.map((id: string) => ({ id })) }
          : undefined,
        variants: variants?.length
          ? {
              create: variants.map((v: { erpVariantCode?: string | null; size: number; packagingType: string; price: number; discountedPrice: number | null; stock: number; sku: string; maxOrderQuantity?: number | null }) => ({
                erpVariantCode: v.erpVariantCode ?? null,
                size: v.size,
                packagingType: v.packagingType,
                price: v.price,
                discountedPrice: v.discountedPrice,
                stock: v.stock,
                sku: v.sku || null,
                maxOrderQuantity: v.maxOrderQuantity ?? null,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/urunlerimiz");
    revalidatePath("/urunlerimiz/[slug]", "page");

    await logAction({ adminId: session.adminId, action: "create", module: "products", targetId: product.id, targetLabel: product.name, newData: { id: product.id, name: product.name, slug: product.slug }, req });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
