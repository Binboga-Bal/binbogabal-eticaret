import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/admin-auth/password";
import { sendAdminMail } from "@/lib/mail/admin-mail.service";

interface ImportRow {
  name: string;
  email: string;
  role_slug: string;
  department?: string;
}

interface ImportResult {
  success: ImportRow[];
  errors: { row: number; email: string; error: string }[];
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return headers.reduce<Record<string, string>>((obj, h, i) => { obj[h] = values[i] ?? ""; return obj; }, {}) as unknown as ImportRow;
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "admin_users", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Form verisi gerekli" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "CSV dosyası gerekli" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);

  const result: ImportResult = { success: [], errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.name || !row.email || !row.role_slug) {
        result.errors.push({ row: rowNum, email: row.email ?? "?", error: "name, email ve role_slug zorunludur" });
        continue;
      }

      const role = await prisma.adminRole.findUnique({ where: { slug: row.role_slug } });
      if (!role) {
        result.errors.push({ row: rowNum, email: row.email, error: `Rol bulunamadı: ${row.role_slug}` });
        continue;
      }

      const existing = await prisma.adminUser.findUnique({ where: { email: row.email } });
      if (existing) {
        result.errors.push({ row: rowNum, email: row.email, error: "Bu email zaten kayıtlı" });
        continue;
      }

      const inviteToken = randomUUID();
      const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const admin = await prisma.adminUser.create({
        data: {
          email: row.email,
          name: row.name,
          department: row.department,
          passwordHash: await hashPassword(randomUUID()),
          status: "INVITED",
          inviteToken,
          inviteTokenExpiry,
          invitedBy: session.adminId,
          roles: { create: [{ roleId: role.id, assignedBy: session.adminId }] },
        },
      });

      await sendAdminMail("invite", row.email, { name: row.name, token: inviteToken });

      result.success.push(row);
    } catch (err) {
      result.errors.push({ row: rowNum, email: row.email ?? "?", error: String(err) });
    }
  }

  return NextResponse.json(result);
}
