import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendVerifyEmail, sendWelcomeEmail } from "@/lib/mail/mail.service";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  kvkkConsent: z.boolean().refine((v) => v === true, { message: "KVKK onayı zorunludur" }),
  newsletterConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
});

export async function POST(req: Request) {
  const actorIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? undefined;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
  }

  const { name, email, phone, password, kvkkConsent, newsletterConsent, smsConsent } = parsed.data;
  const ip = actorIp ?? undefined;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerifyToken = randomUUID();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone ?? null,
      password: passwordHash,
      role: "CUSTOMER",
      emailVerifyToken,
      consentLogs: {
        create: [
          { type: "kvkk", granted: kvkkConsent, ip },
          { type: "newsletter", granted: newsletterConsent ?? false, ip },
          { type: "sms", granted: smsConsent ?? false, ip },
        ],
      },
      notificationPreference: {
        create: {
          newsletter: newsletterConsent ?? false,
          smsNotifications: smsConsent ?? false,
        },
      },
    },
    select: { id: true, email: true, name: true },
  });

  await sendVerifyEmail(user.email, user.name ?? "Müşterimiz", emailVerifyToken)
    .catch((err) => console.error("[register] sendVerifyEmail hata:", err));
  await sendWelcomeEmail(user.email, user.name ?? "Müşterimiz")
    .catch((err) => console.error("[register] sendWelcomeEmail hata:", err));

  void createLog({
    level: "INFO",
    category: "ACCOUNT",
    action: LOG_ACTIONS.USER_REGISTERED,
    message: `Yeni kayıt: ${email}`,
    actorId: user.id,
    actorEmail: user.email,
    actorRole: "CUSTOMER",
    actorIp: actorIp,
    targetType: "User",
    targetId: user.id,
    targetLabel: user.email,
    method: "POST",
    path: "/api/auth/register",
    statusCode: 200,
  });

  return NextResponse.json({ message: "Kayıt başarılı. E-postanızı doğrulayın." });
}
