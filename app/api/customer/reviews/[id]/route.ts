import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/customer-auth";
import { z } from "zod";

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
  if (review.userId !== user.id) return forbidden();

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const updated = await prisma.review.update({
    where: { id },
    data: { ...parsed.data, isApproved: false }, // güncelleme sonrası tekrar onay gerekir
  });

  return NextResponse.json(updated);
}
