import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validatePassword, checkPasswordReuse, hashPassword } from "@/lib/admin-auth/password";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { token, password } = parsed.data;

  const admin = await prisma.adminUser.findFirst({
    where: {
      inviteToken: token,
      inviteTokenExpiry: { gt: new Date() },
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
  }

  const validation = await validatePassword(password);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 });
  }

  const reused = await checkPasswordReuse(admin.id, password);
  if (reused) {
    return NextResponse.json({ error: "Bu şifreyi daha önce kullandınız. Farklı bir şifre seçin." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const previousPasswords = [admin.passwordHash, ...admin.previousPasswords].slice(0, 5);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      previousPasswords,
      passwordChangedAt: new Date(),
      mustChangePassword: false,
      inviteToken: null,
      inviteTokenExpiry: null,
      status: admin.status === "INVITED" ? "ACTIVE" : admin.status,
    },
  });

  return NextResponse.json({ ok: true });
}
