import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { z } from "zod";
import { sendReviewReplyEmail } from "@/lib/mail/mail.service";

const patchSchema = z.object({
  isApproved: z.boolean().optional(),
  adminReply: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "content", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

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
    ).catch(() => {});
  }

  return NextResponse.json(review);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "content", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ message: "Yorum silindi" });
}
