import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";
import { z } from "zod";

async function getOwnedAddress(addressId: string, userId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address) return null;
  if (address.userId !== userId) return "forbidden";
  return address;
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  neighborhood: z.string().optional(),
  fullAddress: z.string().min(1).optional(),
  zipCode: z.string().optional(),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  isBilling: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const check = await getOwnedAddress(id, user.id);
  if (!check) return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  if (check === "forbidden") return forbidden();

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const updated = await prisma.address.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const check = await getOwnedAddress(id, user.id);
  if (!check) return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  if (check === "forbidden") return forbidden();

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ message: "Adres silindi" });
}
