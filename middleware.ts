import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/admin-auth/jwt";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { findRedirect, incrementHitCount } from "@/lib/seo/redirect.service";
import { detectLlmBot } from "@/lib/seo/generative/bot-detector";

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

  // ─── LLM Bot tespiti & loglama ────────────────────────────────────
  const userAgent = req.headers.get("user-agent") ?? "";
  const llmBot = detectLlmBot(userAgent);
  if (llmBot) {
    // Arkaplan logu — middleware'i bloklamaz
    prisma.llmBotAccess.create({
      data: {
        botName: llmBot.name,
        url: pathname,
        statusCode: 200,
        userAgent,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      },
    }).catch(() => null);
  }

  // ─── Redirect motoru ───────────────────────────────────────────────
  // Sadece navigasyon isteklerinde çalış (API, statik asset, _next hariç)
  if (
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/admin/") &&
    !pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff2?)$/)
  ) {
    const redirect = await findRedirect(pathname).catch(() => null);
    if (redirect) {
      // Hit count'u arkaplan görevine bırak (middleware'i yavaşlatmaz)
      incrementHitCount(redirect.id).catch(() => null);
      return NextResponse.redirect(new URL(redirect.toPath, req.url), redirect.statusCode);
    }
  }

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
  // Redirect motoru için tüm sayfa route'larını ekle (API ve statik dosyalar hariç)
  matcher: [
    "/admin/:path*",
    "/hesabim/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?)).*)",
  ],
};
