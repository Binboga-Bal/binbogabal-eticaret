import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1).regex(/^[a-z_]+$/) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "roles", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const source = await prisma.adminRole.findUnique({ where: { id }, include: { permissions: true } });
  if (!source) return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });

  const existing = await prisma.adminRole.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });

  const newRole = await prisma.adminRole.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: source.description,
      color: source.color,
      isSystem: false,
      createdBy: session.adminId,
      permissions: {
        create: source.permissions.map((p) => ({
          permissionId: p.permissionId,
          granted: p.granted,
          assignedBy: session.adminId,
        })),
      },
    },
  });

  return NextResponse.json(newRole, { status: 201 });
}
