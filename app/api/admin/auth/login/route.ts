import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/admin-auth/jwt";
import { isIPAllowed, isWithinAllowedHours, isSuspiciousLogin } from "@/lib/admin-auth/ip-check";
import { verifyTOTP, verifyBackupCode } from "@/lib/admin-auth/2fa";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth/session";
import { logAction } from "@/lib/audit/logger";
import { randomUUID } from "crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
});

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { email, password, totpCode } = parsed.data;
  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") ?? "";

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

  if (!admin) {
    return NextResponse.json({ error: "Email veya şifre hatalı" }, { status: 401 });
  }

  // Status checks
  if (admin.status === "INACTIVE" || admin.status === "SUSPENDED") {
    return NextResponse.json({ error: "Hesabınız aktif değil. Yöneticinize başvurun." }, { status: 403 });
  }

  if (admin.status === "LOCKED") {
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json({ error: `Hesabınız kilitli. ${minutes} dakika sonra tekrar deneyin.` }, { status: 423 });
    }
    // Lock expired — unlock
    await prisma.adminUser.update({ where: { id: admin.id }, data: { status: "ACTIVE", lockedUntil: null, failedLoginCount: 0 } });
  }

  if (admin.status === "INVITED") {
    return NextResponse.json({ error: "Lütfen önce davet mailinizden şifrenizi belirleyin." }, { status: 403 });
  }

  // IP check
  const ipOk = await isIPAllowed(ip, admin.id);
  if (!ipOk) {
    return NextResponse.json({ error: "Bu IP adresinden giriş yapmanıza izin verilmiyor." }, { status: 403 });
  }

  // Time check
  const timeOk = isWithinAllowedHours(admin.allowedLoginStart, admin.allowedLoginEnd, admin.allowedDays);
  if (!timeOk) {
    return NextResponse.json({ error: "Bu saatte giriş yapma yetkiniz bulunmuyor." }, { status: 403 });
  }

  // Password check
  const passwordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordValid) {
    const policy = await prisma.passwordPolicy.findFirst();
    const maxAttempts = policy?.maxFailedAttempts ?? 5;
    const lockoutMinutes = policy?.lockoutDuration ?? 30;
    const newCount = admin.failedLoginCount + 1;

    if (newCount >= maxAttempts) {
      const lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { failedLoginCount: newCount, status: "LOCKED", lockedUntil },
      });
      await logAction({ adminId: admin.id, action: "account_locked", module: "auth", req });
      return NextResponse.json({ error: `Çok fazla hatalı deneme. Hesabınız ${lockoutMinutes} dakika kilitlendi.` }, { status: 423 });
    }

    await prisma.adminUser.update({ where: { id: admin.id }, data: { failedLoginCount: newCount } });
    return NextResponse.json({ error: "Email veya şifre hatalı" }, { status: 401 });
  }

  // 2FA check
  const policy = await prisma.passwordPolicy.findFirst();
  const roleSlugs = admin.roles.map((r) => r.role.slug);
  const requires2FA =
    admin.twoFactorEnabled ||
    (policy?.require2FAForRoles ?? []).some((slug) => roleSlugs.includes(slug));

  if (requires2FA && admin.twoFactorEnabled) {
    if (!totpCode) {
      return NextResponse.json({ error: "2FA kodu gerekli", requires2FA: true }, { status: 200 });
    }

    let codeValid = verifyTOTP(totpCode, admin.twoFactorSecret!);

    if (!codeValid) {
      // Try backup code
      const backupIdx = await verifyBackupCode(totpCode, admin.twoFactorBackupCodes);
      if (backupIdx !== -1) {
        const updatedCodes = [...admin.twoFactorBackupCodes];
        updatedCodes.splice(backupIdx, 1);
        await prisma.adminUser.update({ where: { id: admin.id }, data: { twoFactorBackupCodes: updatedCodes } });
        codeValid = true;
      }
    }

    if (!codeValid) {
      return NextResponse.json({ error: "Geçersiz 2FA kodu", requires2FA: true }, { status: 401 });
    }
  }

  // Detect suspicious login
  const suspicious = isSuspiciousLogin(admin.lastLoginCountry, null, admin.lastLoginAt);

  // Create session
  const sessionId = randomUUID();
  const sessionTimeout = policy?.sessionTimeoutMinutes ?? 480;
  const expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      id: sessionId,
      userId: admin.id,
      token: sessionId,
      ipAddress: ip,
      userAgent,
      isSuspicious: suspicious,
      expiresAt,
    },
  });

  // Update admin login info
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      failedLoginCount: 0,
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      status: "ACTIVE",
      lockedUntil: null,
    },
  });

  // Password expiry check
  if (policy?.expiryDays && admin.passwordChangedAt) {
    const expiredAt = new Date(admin.passwordChangedAt.getTime() + policy.expiryDays * 86400 * 1000);
    if (new Date() > expiredAt) {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { mustChangePassword: true } });
    }
  }

  const tokenPayload = {
    sub: admin.id,
    email: admin.email,
    isSuperAdmin: admin.isSuperAdmin,
    roles: roleSlugs,
    sessionId,
  };

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(tokenPayload),
    signRefreshToken(tokenPayload),
  ]);

  await logAction({ adminId: admin.id, action: "login", module: "auth", req });

  const res = NextResponse.json({
    ok: true,
    mustChangePassword: admin.mustChangePassword,
    isSuspicious: suspicious,
    admin: { id: admin.id, email: admin.email, name: admin.name, isSuperAdmin: admin.isSuperAdmin, roles: roleSlugs },
  });

  res.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 900,
  });
  res.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    path: "/api/admin/auth/refresh",
    sameSite: "lax",
    maxAge: sessionTimeout * 60,
  });

  return res;
}
