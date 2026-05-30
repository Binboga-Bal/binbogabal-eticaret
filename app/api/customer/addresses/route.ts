import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

const addressSchema = z.object({
  title: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  neighborhood: z.string().optional(),
  fullAddress: z.string().min(1),
  zipCode: z.string().optional(),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  isDefault: z.boolean().optional(),
  isBilling: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz adres verisi" }, { status: 400 });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(address, { status: 201 });
}
