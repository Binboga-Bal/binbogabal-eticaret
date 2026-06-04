import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { invalidateTelegramCache } from "@/lib/logger/cache";
import { z } from "zod";
import { type LogLevel, type LogCategory, type TelegramLogSource } from "@prisma/client";

const updateSchema = z.object({
  isActive: z.boolean().optional(),
  label: z.string().optional(),
  logSource: z.enum(["ACTIVITY", "AUDIT", "ALL"]).optional(),
  levels: z.array(z.enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])).optional(),
  categories: z.array(z.string()).optional(),
  auditModules: z.array(z.string()).optional(),
  minRiskScore: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const config = await prisma.telegramAlertConfig.update({
    where: { id },
    data: {
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      ...(parsed.data.label && { label: parsed.data.label }),
      ...(parsed.data.logSource && { logSource: parsed.data.logSource as TelegramLogSource }),
      ...(parsed.data.levels && { levels: parsed.data.levels as LogLevel[] }),
      ...(parsed.data.categories && { categories: parsed.data.categories as LogCategory[] }),
      ...(parsed.data.auditModules !== undefined && { auditModules: parsed.data.auditModules }),
      ...(parsed.data.minRiskScore !== undefined && { minRiskScore: parsed.data.minRiskScore }),
    },
  });
  invalidateTelegramCache();
  return NextResponse.json(config);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { id } = await params;
  await prisma.telegramAlertConfig.delete({ where: { id } });
  invalidateTelegramCache();
  return new NextResponse(null, { status: 204 });
}
