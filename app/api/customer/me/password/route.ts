import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/mail/mail.service";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.password) return NextResponse.json({ error: "Şifre değiştirilemedi" }, { status: 400 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });

  await sendPasswordChangedEmail(dbUser.email, dbUser.name ?? "Müşterimiz").catch(() => null);

  return NextResponse.json({ message: "Şifreniz güncellendi" });
}
