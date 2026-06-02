import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz email" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });

  // Always return success to avoid user enumeration
  if (admin && admin.status === "ACTIVE") {
    const token = randomUUID();
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { inviteToken: token, inviteTokenExpiry: expiry },
    });

    await sendAdminMail("password-reset", admin.email, { name: admin.name, token });
  }

  return NextResponse.json({ ok: true, message: "Şifre sıfırlama maili gönderildi (eğer hesap mevcutsa)" });
}
