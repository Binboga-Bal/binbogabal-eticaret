import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const rules = await prisma.volumeDiscount.findMany({
    include: {
      products: {
        include: {
          product: { select: { id: true, name: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { name, isActive, tiers, productIds } = await req.json();

  if (!name || !tiers?.length) {
    return NextResponse.json({ error: "Ad ve en az bir kademe zorunludur." }, { status: 400 });
  }

  const rule = await prisma.volumeDiscount.create({
    data: {
      name,
      isActive: isActive ?? true,
      tiers,
      products: productIds?.length
        ? { create: productIds.map((productId: string) => ({ productId })) }
        : undefined,
    },
    include: { products: { include: { product: { select: { id: true, name: true, images: true } } } } },
  });

  return NextResponse.json(rule);
}
