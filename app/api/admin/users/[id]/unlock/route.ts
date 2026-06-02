import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { logAction } from "@/lib/audit/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  await prisma.adminUser.update({ where: { id }, data: { status: "ACTIVE", failedLoginCount: 0, lockedUntil: null } });

  await logAction({ adminId: session.adminId, action: "unlock", module: "admin_users", targetId: id, targetLabel: admin.name, req });

  return NextResponse.json({ ok: true });
}
