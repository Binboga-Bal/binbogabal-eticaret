import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Geçersiz bağlantı" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), emailVerifyToken: null },
  });

  await createLog({
    level: "INFO",
    category: "VERIFICATION",
    action: LOG_ACTIONS.USER_EMAIL_VERIFIED,
    message: `E-posta adresi doğrulandı`,
    actorId: user.id,
    actorEmail: user.email,
    targetType: "User",
    targetId: user.id,
    detail: { verifiedAt: new Date().toISOString() },
    method: "GET",
    path: "/api/auth/verify-email",
    statusCode: 302,
  });

  return NextResponse.redirect(new URL("/hesabim?verified=1", req.url));
}
