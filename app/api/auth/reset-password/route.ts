import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/mail/mail.service";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  await sendPasswordChangedEmail(user.email, user.name ?? "Müşterimiz").catch(() => null);

  return NextResponse.json({ message: "Şifreniz başarıyla güncellendi" });
}
