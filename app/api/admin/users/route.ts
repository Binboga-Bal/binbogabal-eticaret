import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { logAction } from "@/lib/audit/logger";
import { randomUUID } from "crypto";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";
import { hashPassword } from "@/lib/admin-auth/password";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  department: z.string().optional(),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const roleSlug = searchParams.get("role") ?? undefined;
  const department = searchParams.get("department") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(department ? { department } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(roleSlug ? {
      roles: { some: { role: { slug: roleSlug } } },
    } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.adminUser.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        roles: { include: { role: true } },
        _count: { select: { sessions: true } },
      },
    }),
    prisma.adminUser.count({ where }),
  ]);

  const sanitized = users.map(({ passwordHash, twoFactorSecret, twoFactorBackupCodes, previousPasswords, inviteToken, ...u }) => u);

  return NextResponse.json({ users: sanitized, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { email, name, department, phone, roleIds } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Bu email zaten kayıtlı" }, { status: 409 });

  const inviteToken = randomUUID();
  const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      name,
      department,
      phone,
      passwordHash: await hashPassword(randomUUID()), // placeholder
      status: "INVITED",
      inviteToken,
      inviteTokenExpiry,
      invitedBy: session.adminId,
      roles: { create: roleIds.map((roleId) => ({ roleId, assignedBy: session.adminId })) },
    },
    include: { roles: { include: { role: true } } },
  });

  await sendAdminMail("invite", email, { name, token: inviteToken });

  const inviterAdmin = await prisma.adminUser.findUnique({ where: { id: session.adminId }, select: { name: true } });
  const superAdmins = await prisma.adminUser.findMany({ where: { isSuperAdmin: true, status: "ACTIVE" }, select: { email: true } });
  for (const sa of superAdmins) {
    await sendAdminMail("new-admin-alert", sa.email, {
      name,
      email,
      roles: admin.roles.map((r) => r.role.name).join(", "),
      addedBy: inviterAdmin?.name ?? session.email,
    });
  }

  await logAction({ adminId: session.adminId, action: "create", module: "admin_users", targetId: admin.id, targetLabel: `${name} (${email})`, req });

  const { passwordHash, twoFactorSecret, twoFactorBackupCodes, previousPasswords, inviteToken: t, ...safeAdmin } = admin as typeof admin & { inviteToken: string | null };
  return NextResponse.json(safeAdmin, { status: 201 });
}
