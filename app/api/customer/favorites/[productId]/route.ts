import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { productId } = await params;

  await prisma.favorite.deleteMany({
    where: { userId: user.id, productId },
  });

  return NextResponse.json({ message: "Favorilerden kaldırıldı" });
}
