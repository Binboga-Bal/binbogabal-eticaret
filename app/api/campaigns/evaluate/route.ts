import { NextResponse } from "next/server";
import { evaluateCampaigns } from "@/lib/campaign/engine";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { EvaluationContext, CartItem } from "@/lib/campaign/types";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const { cart: rawCart, couponCode, device, city, paymentMethod } = body as {
    cart: { variantId: string; productId: string; quantity: number; price: number; discountedPrice?: number | null; productName: string }[];
    couponCode?: string;
    device?: string;
    city?: string;
    paymentMethod?: string;
  };

  // Sunucu tarafında categoryIds zenginleştir
  const productIds = [...new Set(rawCart.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, categories: { select: { id: true } } },
  });
  const categoryMap = new Map(products.map((p) => [p.id, p.categories.map((c) => c.id)]));

  const cart: CartItem[] = rawCart.map((item) => ({
    variantId: item.variantId,
    productId: item.productId,
    categoryIds: categoryMap.get(item.productId) ?? [],
    quantity: item.quantity,
    price: item.price,
    discountedPrice: item.discountedPrice ?? undefined,
    productName: item.productName,
  }));

  let customer: EvaluationContext["customer"] = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        orders: {
          where: { paymentStatus: "PAID" },
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (user) {
      customer = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        orderCount: user.orders.length,
        totalSpend: user.orders.reduce((s, o) => s + Number(o.total), 0),
        lastOrderAt: user.orders[0]?.createdAt,
        city,
      };
    }
  }

  const result = await evaluateCampaigns({
    cart,
    customer,
    couponCode,
    device: device as "mobile" | "desktop" | undefined,
    city,
    paymentMethod,
  });

  return NextResponse.json(result);
}
