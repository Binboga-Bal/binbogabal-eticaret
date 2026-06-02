import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  // User can view own sessions; admins with permission can view others'
  if (id !== session.adminId && !await can(session.adminId, "admin_users", "view")) {
    return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });
  }

  const sessions = await prisma.adminSession.findMany({
    where: { userId: id, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
  });

  return NextResponse.json(sessions);
}
