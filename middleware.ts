import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const PUBLIC_HESABIM = ["/hesabim/giris", "/hesabim/kayit", "/hesabim/sifremi-unuttum", "/hesabim/sifre-sifirla"];
  const isCustomerPath = pathname.startsWith("/hesabim") && !PUBLIC_HESABIM.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/hesabim/giris?from=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if (!["ADMIN", "SUPERADMIN", "EDITOR"].includes(userRole ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isCustomerPath && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/hesabim/giris?redirect=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
