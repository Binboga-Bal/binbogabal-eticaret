import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth/session";

const updateSchema = z.object({
  minLength: z.number().int().min(6).max(32).optional(),
  requireUppercase: z.boolean().optional(),
  requireLowercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  preventReuse: z.number().int().min(0).max(24).optional(),
  expiryDays: z.number().int().min(0).nullable().optional(),
  maxFailedAttempts: z.number().int().min(3).max(10).optional(),
  lockoutDuration: z.number().int().min(5).max(1440).optional(),
  sessionTimeoutMinutes: z.number().int().min(30).max(1440).optional(),
  require2FAForRoles: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const policy = await prisma.passwordPolicy.findFirst();
  return NextResponse.json(policy);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.passwordPolicy.findFirst();
  const policy = existing
    ? await prisma.passwordPolicy.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.passwordPolicy.create({ data: parsed.data as never });

  return NextResponse.json(policy);
}
