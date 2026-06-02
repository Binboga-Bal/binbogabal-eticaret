import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { logAction } from "@/lib/audit/logger";
import { invalidatePermissionCache } from "@/lib/rbac/cache";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  allowedLoginStart: z.string().optional(),
  allowedLoginEnd: z.string().optional(),
  allowedDays: z.array(z.number()).optional(),
});

function safeAdmin<T extends { passwordHash?: unknown; twoFactorSecret?: unknown; twoFactorBackupCodes?: unknown; previousPasswords?: unknown; inviteToken?: unknown }>(admin: T) {
  const { passwordHash, twoFactorSecret, twoFactorBackupCodes, previousPasswords, inviteToken, ...rest } = admin;
  return rest;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const admin = await prisma.adminUser.findUnique({
    where: { id },
    include: {
      roles: { include: { role: true } },
      allowedIPs: true,
      temporaryPermissions: { where: { isActive: true, validUntil: { gt: new Date() } }, include: { permission: true } },
    },
  });

  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json(safeAdmin(admin));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const prev = await prisma.adminUser.findUnique({ where: { id } });
  if (!prev) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const updated = await prisma.adminUser.update({ where: { id }, data: parsed.data });

  await logAction({
    adminId: session.adminId,
    action: "update",
    module: "admin_users",
    targetId: id,
    targetLabel: updated.name,
    previousData: parsed.data,
    newData: updated,
    req,
  });

  return NextResponse.json(safeAdmin(updated));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  if (id === session.adminId) return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (admin.isSuperAdmin) return NextResponse.json({ error: "Süper Admin silinemez" }, { status: 403 });

  // Soft delete: set INACTIVE
  await prisma.adminUser.update({ where: { id }, data: { status: "INACTIVE", email: `${admin.email}__deleted_${Date.now()}` } });

  invalidatePermissionCache(id);

  await logAction({ adminId: session.adminId, action: "delete", module: "admin_users", targetId: id, targetLabel: admin.name, req });

  return NextResponse.json({ ok: true });
}
