import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { hashPassword } from "@/lib/admin-auth/password";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const token = randomUUID();
  const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await prisma.adminUser.update({
    where: { id },
    data: { inviteToken: token, inviteTokenExpiry: expiry, mustChangePassword: true },
  });

  await sendAdminMail("password-reset", admin.email, { name: admin.name, token });

  return NextResponse.json({ ok: true });
}
