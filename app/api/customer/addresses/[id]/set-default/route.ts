import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  if (address.userId !== user.id) return forbidden();

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  return NextResponse.json({ message: "Varsayılan adres güncellendi" });
}
