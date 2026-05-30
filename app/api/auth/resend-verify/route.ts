import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendVerifyEmail } from "@/lib/mail/mail.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ message: "E-posta zaten doğrulandı" });

  const token = randomUUID();
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: token } });
  await sendVerifyEmail(user.email, user.name ?? "Müşterimiz", token).catch(() => null);

  return NextResponse.json({ message: "Doğrulama maili gönderildi" });
}
