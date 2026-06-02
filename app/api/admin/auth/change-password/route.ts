import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { validatePassword, checkPasswordReuse, hashPassword } from "@/lib/admin-auth/password";
import { logAction } from "@/lib/audit/logger";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { currentPassword, newPassword } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const currentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!currentValid) return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });

  const validation = await validatePassword(newPassword);
  if (!validation.valid) return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 });

  const reused = await checkPasswordReuse(admin.id, newPassword);
  if (reused) return NextResponse.json({ error: "Bu şifreyi daha önce kullandınız." }, { status: 400 });

  const passwordHash = await hashPassword(newPassword);
  const previousPasswords = [admin.passwordHash, ...admin.previousPasswords].slice(0, 5);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash, previousPasswords, passwordChangedAt: new Date(), mustChangePassword: false },
  });

  await logAction({ adminId: admin.id, action: "password_changed", module: "auth", req });

  return NextResponse.json({ ok: true });
}
