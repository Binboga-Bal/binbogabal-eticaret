import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, phone: true, avatarUrl: true, emailVerified: true, createdAt: true },
  });

  return NextResponse.json(data);
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { id: true, email: true, name: true, phone: true, avatarUrl: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: false,
      scheduledDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ message: "Hesabınız 30 gün içinde silinecektir" });
}
