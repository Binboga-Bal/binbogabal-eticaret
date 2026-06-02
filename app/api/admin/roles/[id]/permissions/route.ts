import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { invalidateAllPermissionCaches } from "@/lib/rbac/cache";
import { logAction } from "@/lib/audit/logger";

const schema = z.object({
  permissions: z.array(z.object({ permissionId: z.string(), granted: z.boolean() })),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const rolePerms = await prisma.adminRolePermission.findMany({
    where: { roleId: id },
    include: { permission: true },
    orderBy: [{ permission: { module: "asc" } }, { permission: { action: "asc" } }],
  });

  return NextResponse.json(rolePerms);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const role = await prisma.adminRole.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });

  // Upsert each permission
  for (const { permissionId, granted } of parsed.data.permissions) {
    await prisma.adminRolePermission.upsert({
      where: { roleId_permissionId: { roleId: id, permissionId } },
      create: { roleId: id, permissionId, granted, assignedBy: session.adminId },
      update: { granted, assignedBy: session.adminId },
    });
  }

  invalidateAllPermissionCaches();
  await logAction({ adminId: session.adminId, action: "permissions_updated", module: "roles", targetId: id, targetLabel: role.name, req });

  return NextResponse.json({ ok: true });
}
