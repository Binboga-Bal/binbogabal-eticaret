import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { invalidateTelegramCache } from "@/lib/logger/cache";
import { z } from "zod";
import { type LogLevel, type LogCategory, type TelegramLogSource } from "@prisma/client";

const createSchema = z.object({
  chatId: z.string().min(1),
  label: z.string().min(1),
  logSource: z.enum(["ACTIVITY", "AUDIT", "ALL"]).optional(),
  levels: z.array(z.enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])).optional(),
  categories: z.array(z.string()).optional(),
  auditModules: z.array(z.string()).optional(),
  minRiskScore: z.number().int().min(0).max(100).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const configs = await prisma.telegramAlertConfig.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const config = await prisma.telegramAlertConfig.create({
    data: {
      chatId: parsed.data.chatId,
      label: parsed.data.label,
      logSource: (parsed.data.logSource ?? "ALL") as TelegramLogSource,
      levels: (parsed.data.levels ?? ["ERROR", "CRITICAL"]) as LogLevel[],
      categories: (parsed.data.categories ?? []) as LogCategory[],
      auditModules: parsed.data.auditModules ?? [],
      minRiskScore: parsed.data.minRiskScore ?? 0,
    },
  });
  invalidateTelegramCache();
  return NextResponse.json(config, { status: 201 });
}
