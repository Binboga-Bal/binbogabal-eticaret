import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  images: true,
  isBestseller: true,
  isFeatured: true,
  bestsellOrder: true,
  featuredOrder: true,
  isActive: true,
} as const;

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "view"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const [bestsellers, featured, allProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isBestseller: true },
      select: PRODUCT_SELECT,
      orderBy: { bestsellOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isFeatured: true },
      select: PRODUCT_SELECT,
      orderBy: { featuredOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: PRODUCT_SELECT,
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ bestsellers, featured, allProducts });
}

// PATCH: bulk update one vitrin's product list + order
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "products", "update"))
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { type, items } = await req.json() as {
    type: "bestsellers" | "featured";
    // items = current ordered list of product IDs in the vitrin
    items: string[];
  };

  if (type !== "bestsellers" && type !== "featured")
    return NextResponse.json({ error: "Geçersiz vitrin türü" }, { status: 400 });

  const isBestsellerType = type === "bestsellers";
  const orderField = isBestsellerType ? "bestsellOrder" : "featuredOrder";
  const flagField = isBestsellerType ? "isBestseller" : "isFeatured";

  // Get current vitrin members to know which to remove
  const currentMembers = await prisma.product.findMany({
    where: { [flagField]: true },
    select: { id: true },
  });
  const currentIds = currentMembers.map((p) => p.id);
  const toRemove = currentIds.filter((id) => !items.includes(id));
  const toAdd = items.filter((id) => !currentIds.includes(id));

  await prisma.$transaction([
    // Remove products no longer in vitrin
    ...toRemove.map((id) =>
      prisma.product.update({ where: { id }, data: { [flagField]: false, [orderField]: 0 } })
    ),
    // Add new products and set orders
    ...items.map((id, idx) =>
      prisma.product.update({
        where: { id },
        data: { [flagField]: true, [orderField]: idx },
      })
    ),
  ]);

  // Mark newly added products (to suppress TS warning on unused variable)
  void toAdd;

  revalidatePath("/");
  revalidatePath("/urunlerimiz");
  return NextResponse.json({ ok: true });
}
