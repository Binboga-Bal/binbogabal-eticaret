import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/admin-auth/jwt";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PUBLIC_ADMIN_PATHS = [
  "/admin/auth/login",
  "/admin/auth/forgot-password",
  "/admin/auth/reset-password",
  "/admin/auth/accept-invite",
];

const PUBLIC_CUSTOMER_PATHS = [
  "/hesabim/giris",
  "/hesabim/kayit",
  "/hesabim/sifremi-unuttum",
  "/hesabim/sifre-sifirla",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Admin routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow public admin paths — pass pathname via header for layout detection
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      const res = NextResponse.next();
      res.headers.set("x-admin-pathname", pathname);
      return res;
    }

    const token = req.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

    if (!token) {
      return NextResponse.redirect(new URL(`/admin/auth/login?from=${encodeURIComponent(pathname)}`, req.url));
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/admin/auth/login", req.url));
      res.cookies.set(ADMIN_ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }

    // Verify session still exists and user is active in DB
    const dbSession = await prisma.adminSession.findUnique({
      where: { id: payload.sessionId },
      select: { expiresAt: true, user: { select: { status: true } } },
    });

    if (!dbSession || dbSession.expiresAt < new Date() || dbSession.user.status !== "ACTIVE") {
      const res = NextResponse.redirect(new URL("/admin/auth/login", req.url));
      res.cookies.set(ADMIN_ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
      res.cookies.set(ADMIN_REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }

    const res = NextResponse.next();
    res.headers.set("x-admin-pathname", pathname);
    return res;
  }

  // ─── Customer routes ───────────────────────────────────────────────
  const isCustomerPath = pathname.startsWith("/hesabim") && !PUBLIC_CUSTOMER_PATHS.some((p) => pathname.startsWith(p));

  if (isCustomerPath) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL(`/hesabim/giris?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
