import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { verifyTOTP, generateBackupCodes } from "@/lib/admin-auth/2fa";
import { logAction } from "@/lib/audit/logger";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin || !admin.twoFactorSecret) return NextResponse.json({ error: "2FA kurulumu başlatılmamış" }, { status: 400 });

  const valid = verifyTOTP(parsed.data.code, admin.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });

  const { plain, hashed } = await generateBackupCodes();

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { twoFactorEnabled: true, twoFactorBackupCodes: hashed },
  });

  await logAction({ adminId: admin.id, action: "2fa_enabled", module: "auth", req });

  return NextResponse.json({ ok: true, backupCodes: plain });
}
