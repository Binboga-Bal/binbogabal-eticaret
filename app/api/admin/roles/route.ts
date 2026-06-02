import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { logAction } from "@/lib/audit/logger";
import { invalidateAllPermissionCaches } from "@/lib/rbac/cache";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z_]+$/),
  description: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const roles = await prisma.adminRole.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, permissions: true } },
      parent: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.adminRole.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });

  const role = await prisma.adminRole.create({
    data: { ...parsed.data, createdBy: session.adminId },
  });

  await logAction({ adminId: session.adminId, action: "create", module: "roles", targetId: role.id, targetLabel: role.name, req });

  return NextResponse.json(role, { status: 201 });
}
