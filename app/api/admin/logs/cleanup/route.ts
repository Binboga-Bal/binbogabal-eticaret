import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";
import { type LogLevel } from "@prisma/client";
import { extractRequestMeta } from "@/lib/logger/utils";
import { z } from "zod";

const schema = z.object({
  olderThanDays: z.number().int().min(30),
  level: z.array(z.enum(["DEBUG", "INFO"])).optional(),
});

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const { olderThanDays, level } = parsed.data;
  // Only DEBUG and INFO can be deleted
  const deletableLevels: LogLevel[] = (level ?? ["DEBUG", "INFO"]).filter(
    (l): l is "DEBUG" | "INFO" => l === "DEBUG" || l === "INFO",
  );

  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const result = await prisma.activityLog.deleteMany({
    where: {
      level: { in: deletableLevels },
      createdAt: { lt: cutoff },
    },
  });

  const meta = extractRequestMeta(req);
  void createLog({
    level: "INFO",
    category: "SYSTEM",
    action: LOG_ACTIONS.SYSTEM_CRON_COMPLETED,
    message: `Log temizleme: ${result.count} kayıt silindi (${olderThanDays}+ gün, levels: ${deletableLevels.join(",")})`,
    actorId: session.adminId,
    actorEmail: session.email,
    actorRole: "SUPERADMIN",
    ...meta,
  });

  return NextResponse.json({ deleted: result.count });
}
