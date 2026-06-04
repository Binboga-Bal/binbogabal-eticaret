import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail/mail.service";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const actorIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? undefined;
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

    await createLog({
      level: "INFO",
      category: "PASSWORD",
      action: LOG_ACTIONS.PASSWORD_RESET_REQUESTED,
      message: `Şifre sıfırlama bağlantısı talep edildi`,
      actorId: user.id,
      actorEmail: user.email,
      actorIp,
      detail: { tokenExpiry: "1 saat" },
      method: "POST",
      path: "/api/auth/forgot-password",
      statusCode: 200,
    });
  }

  return NextResponse.json({ message: "Şifre sıfırlama bağlantısı e-postanıza gönderildi" });
}
