import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth/session";
import { logAction } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (session) {
    await prisma.adminSession.deleteMany({ where: { id: session.sessionId } }).catch(() => {});
    await logAction({ adminId: session.adminId, action: "logout", module: "auth", req });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(ADMIN_REFRESH_COOKIE, "", { maxAge: 0, path: "/api/admin/auth/refresh" });
  return res;
}
