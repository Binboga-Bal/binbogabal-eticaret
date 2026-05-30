import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail/mail.service";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta adresi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Güvenlik: kullanıcı bulunsun ya da bulunmasın aynı mesajı dön
  if (user && user.isActive) {
    const token = randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await sendPasswordResetEmail(user.email, user.name ?? "Müşterimiz", token).catch(() => null);
  }

  return NextResponse.json({ message: "Şifre sıfırlama bağlantısı e-postanıza gönderildi" });
}
