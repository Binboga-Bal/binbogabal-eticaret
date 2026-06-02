import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { generateTOTPSecret, generateQRCode, encryptSecret, generateBackupCodes } from "@/lib/admin-auth/2fa";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (admin.twoFactorEnabled) return NextResponse.json({ error: "2FA zaten aktif" }, { status: 400 });

  const secret = generateTOTPSecret();
  const qrCode = await generateQRCode(admin.email, secret);
  const encryptedSecret = encryptSecret(secret);

  // Save secret (not yet enabled — needs verify step)
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { twoFactorSecret: encryptedSecret },
  });

  return NextResponse.json({ qrCode, secret });
}
