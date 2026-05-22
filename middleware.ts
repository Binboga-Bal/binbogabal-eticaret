import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/hesabim/giris?from=${encodeURIComponent(req.nextUrl.pathname)}`, req.url)
      );
    }
    if (!["ADMIN", "SUPERADMIN", "EDITOR"].includes(userRole ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
