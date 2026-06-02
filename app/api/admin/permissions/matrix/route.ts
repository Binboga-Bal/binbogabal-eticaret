import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { invalidateAllPermissionCaches } from "@/lib/rbac/cache";

const updateSchema = z.object({
  updates: z.array(z.object({
    roleId: z.string(),
    permissionId: z.string(),
    granted: z.boolean(),
  })),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const [roles, permissions, rolePermissions] = await Promise.all([
    prisma.adminRole.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.adminRolePermission.findMany({ include: { permission: true } }),
  ]);

  return NextResponse.json({ roles, permissions, rolePermissions });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  for (const { roleId, permissionId, granted } of parsed.data.updates) {
    await prisma.adminRolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId, granted, assignedBy: session.adminId },
      update: { granted, assignedBy: session.adminId },
    });
  }

  invalidateAllPermissionCaches();
  return NextResponse.json({ ok: true });
}
