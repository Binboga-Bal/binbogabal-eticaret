import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { logAction } from "@/lib/audit/logger";
import { invalidateAllPermissionCaches } from "@/lib/rbac/cache";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
      parent: true,
      children: true,
    },
  });

  if (!role) return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });
  return NextResponse.json(role);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const role = await prisma.adminRole.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });

  const updated = await prisma.adminRole.update({ where: { id }, data: parsed.data });

  invalidateAllPermissionCaches();
  await logAction({ adminId: session.adminId, action: "update", module: "roles", targetId: id, targetLabel: updated.name, req });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "delete")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const role = await prisma.adminRole.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Sistem rolleri silinemez" }, { status: 403 });
  if (role._count.users > 0) return NextResponse.json({ error: "Bu role atanmış kullanıcılar var. Önce kullanıcıların rolünü değiştirin." }, { status: 400 });

  await prisma.adminRole.delete({ where: { id } });

  invalidateAllPermissionCaches();
  await logAction({ adminId: session.adminId, action: "delete", module: "roles", targetId: id, targetLabel: role.name, req });

  return NextResponse.json({ ok: true });
}
