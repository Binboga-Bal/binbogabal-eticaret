import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sessions = await prisma.adminSession.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
    include: { user: { select: { name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(sessions);
}
