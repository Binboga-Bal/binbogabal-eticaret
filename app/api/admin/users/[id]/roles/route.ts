import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { invalidatePermissionCache } from "@/lib/rbac/cache";
import { logAction } from "@/lib/audit/logger";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

const schema = z.object({ roleIds: z.array(z.string()) });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id }, select: { id: true, name: true, email: true, isSuperAdmin: true } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (admin.isSuperAdmin && !session.isSuperAdmin) return NextResponse.json({ error: "Süper Admin rolünü değiştiremezsiniz" }, { status: 403 });

  // Replace all roles
  await prisma.adminUserRole.deleteMany({ where: { userId: id } });
  if (parsed.data.roleIds.length > 0) {
    await prisma.adminUserRole.createMany({
      data: parsed.data.roleIds.map((roleId) => ({ userId: id, roleId, assignedBy: session.adminId })),
    });
  }

  invalidatePermissionCache(id);

  const newRoles = await prisma.adminRole.findMany({ where: { id: { in: parsed.data.roleIds } }, select: { name: true } });

  await sendAdminMail("role-changed", admin.email, {
    name: admin.name,
    roles: newRoles.map((r) => r.name).join(", "),
    changedBy: session.email,
  });

  await logAction({ adminId: session.adminId, action: "roles_updated", module: "admin_users", targetId: id, targetLabel: admin.name, newData: { roleIds: parsed.data.roleIds }, req });

  return NextResponse.json({ ok: true, roles: newRoles });
}
