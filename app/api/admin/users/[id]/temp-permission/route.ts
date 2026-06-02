import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { invalidatePermissionCache } from "@/lib/rbac/cache";
import { logAction } from "@/lib/audit/logger";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

const schema = z.object({
  permissionId: z.string(),
  validUntil: z.string().datetime(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { permissionId, validUntil, reason } = parsed.data;

  const [admin, permission] = await Promise.all([
    prisma.adminUser.findUnique({ where: { id } }),
    prisma.permission.findUnique({ where: { id: permissionId } }),
  ]);

  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (!permission) return NextResponse.json({ error: "İzin bulunamadı" }, { status: 404 });

  const tempPerm = await prisma.temporaryPermission.create({
    data: {
      userId: id,
      permissionId,
      reason,
      grantedBy: session.adminId,
      validUntil: new Date(validUntil),
    },
  });

  invalidatePermissionCache(id);

  await sendAdminMail("temp-permission-granted", admin.email, {
    name: admin.name,
    permission: `${permission.module}:${permission.action}`,
    validUntil: new Date(validUntil).toLocaleString("tr-TR"),
    grantedBy: session.email,
    reason,
  });

  await logAction({ adminId: session.adminId, action: "temp_permission_granted", module: "admin_users", targetId: id, targetLabel: admin.name, req });

  return NextResponse.json(tempPerm, { status: 201 });
}
