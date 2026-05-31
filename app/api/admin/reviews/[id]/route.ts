import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { sendReviewReplyEmail } from "@/lib/mail/mail.service";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function requireAdmin() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) return null;
  return session;
}

const patchSchema = z.object({
  isApproved: z.boolean().optional(),
  adminReply: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return forbidden();

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  // Mevcut yorumu çek — adminReply değişip değişmediğini anlamak için
  const existing = await prisma.review.findUnique({
    where: { id },
    select: {
      adminReply: true,
      comment: true,
      user: { select: { id: true, name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  const review = await prisma.review.update({
    where: { id },
    data: parsed.data,
  });

  // adminReply yeni eklendiyse (önceden yoktu veya değişti) kullanıcıya bildir
  const newReply = parsed.data.adminReply;
  if (
    existing &&
    newReply &&
    newReply.trim() !== "" &&
    newReply !== existing.adminReply &&
    existing.user?.email
  ) {
    sendReviewReplyEmail(
      existing.user.id,
      existing.user.email,
      existing.user.name ?? "Müşterimiz",
      existing.product?.name ?? "",
      existing.product?.slug ?? "",
      existing.comment ?? "",
      newReply,
    ).catch(() => {
      // mail hatası yanıtı engellemesin
    });
  }

  return NextResponse.json(review);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return forbidden();

  const { id } = await params;
  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ message: "Yorum silindi" });
}
