import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { logAction } from "@/lib/audit/logger";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Şifre hatalı" }, { status: 400 });

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
  });

  await logAction({ adminId: admin.id, action: "2fa_disabled", module: "auth", req });

  return NextResponse.json({ ok: true });
}
