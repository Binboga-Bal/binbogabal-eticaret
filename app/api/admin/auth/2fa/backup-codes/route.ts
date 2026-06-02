import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { generateBackupCodes } from "@/lib/admin-auth/2fa";

const schema = z.object({ password: z.string().min(1) });

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Re-generate backup codes (requires password confirmation via POST)
  return NextResponse.json({ message: "Yedek kodları yenilemek için POST isteği gönderin." });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin || !admin.twoFactorEnabled) return NextResponse.json({ error: "2FA aktif değil" }, { status: 400 });

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Şifre hatalı" }, { status: 400 });

  const { plain, hashed } = await generateBackupCodes();
  await prisma.adminUser.update({ where: { id: admin.id }, data: { twoFactorBackupCodes: hashed } });

  return NextResponse.json({ backupCodes: plain });
}
