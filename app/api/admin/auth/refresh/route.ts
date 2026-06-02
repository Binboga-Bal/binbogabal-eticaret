import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/admin-auth/jwt";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.json({ error: "Token bulunamadı" }, { status: 401 });

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });

  // Validate session still exists
  const session = await prisma.adminSession.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Oturum sona erdi" }, { status: 401 });
  }

  // Update last active
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  const roles = await prisma.adminUserRole.findMany({
    where: { userId: payload.sub },
    include: { role: true },
  });

  const newPayload = {
    sub: payload.sub,
    email: payload.email,
    isSuperAdmin: payload.isSuperAdmin,
    roles: roles.map((r) => r.role.slug),
    sessionId: payload.sessionId,
  };

  const [newAccess, newRefresh] = await Promise.all([signAccessToken(newPayload), signRefreshToken(newPayload)]);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_ACCESS_COOKIE, newAccess, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 900 });
  res.cookies.set(ADMIN_REFRESH_COOKIE, newRefresh, { httpOnly: true, path: "/api/admin/auth/refresh", sameSite: "lax", maxAge: 28800 });
  return res;
}
