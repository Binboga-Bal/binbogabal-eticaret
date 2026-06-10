import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFavoriteDiscountEmail } from "@/lib/mail/mail.service";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  // Her favorinin en ucuz aktif varyantını çek; discountedPrice varsa fiyat düşmüş say
  const favorites = await prisma.favorite.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: {
        select: {
          name: true,
          slug: true,
          images: true,
          variants: { where: { isActive: true, discountedPrice: { not: null } }, orderBy: { discountedPrice: "asc" }, take: 1 },
        },
      },
    },
  });

  // Kullanıcı bazında grupla
  const userMap = new Map<string, { user: { id: string; email: string; name: string | null }; products: { name: string; oldPrice: number; newPrice: number; productUrl: string; imageUrl?: string }[] }>();

  for (const fav of favorites) {
    const variant = fav.product.variants[0];
    if (!variant) continue;

    const userId = fav.user.id;
    if (!userMap.has(userId)) {
      userMap.set(userId, { user: fav.user as { id: string; email: string; name: string | null }, products: [] });
    }

    userMap.get(userId)!.products.push({
      name: fav.product.name,
      oldPrice: Number(variant.price),
      newPrice: Number(variant.discountedPrice),
      productUrl: `${process.env.NEXT_PUBLIC_APP_URL}/urunlerimiz/${fav.product.slug}`,
      imageUrl: (fav.product.images as string[])[0] ?? undefined,
    });
  }

  let sent = 0;
  for (const [userId, { user, products }] of userMap) {
    if (products.length === 0) continue;
    await sendFavoriteDiscountEmail(userId, user.email, user.name ?? "Müşterimiz", products).catch(() => null);
    sent++;
  }

  return NextResponse.json({ sent });
}
