import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { logAction } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Delete all sessions except the current one
  const deleted = await prisma.adminSession.deleteMany({
    where: { id: { not: session.sessionId } },
  });

  await logAction({ adminId: session.adminId, action: "force_logout_all", module: "security", req });

  return NextResponse.json({ ok: true, deletedCount: deleted.count });
}
