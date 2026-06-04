import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";
import { type LogLevel, type LogCategory, type Prisma } from "@prisma/client";
import { extractRequestMeta } from "@/lib/logger/utils";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const format = (searchParams.get("format") ?? "csv") as "csv" | "json";

  const levelParam = searchParams.getAll("level") as LogLevel[];
  const categoryParam = searchParams.getAll("category") as LogCategory[];
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const where: Prisma.ActivityLogWhereInput = {
    ...(levelParam.length > 0 && { level: { in: levelParam } }),
    ...(categoryParam.length > 0 && { category: { in: categoryParam } }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const meta = extractRequestMeta(req);
  void createLog({
    level: "INFO",
    category: "DATA_EXPORT",
    action: LOG_ACTIONS.GDPR_DATA_EXPORT_REQUESTED,
    message: `Log export: ${logs.length} kayıt, format: ${format}`,
    actorId: session.adminId,
    actorEmail: session.email,
    actorRole: session.isSuperAdmin ? "SUPERADMIN" : "ADMIN",
    ...meta,
  });

  if (format === "json") {
    return new NextResponse(JSON.stringify(logs, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="activity-logs-${Date.now()}.json"`,
      },
    });
  }

  // CSV
  const CSV_HEADERS = [
    "id", "level", "category", "action", "message",
    "actorId", "actorRole", "actorEmail", "actorIp",
    "targetType", "targetId", "targetLabel",
    "method", "path", "statusCode", "duration",
    "createdAt",
  ];

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [
    CSV_HEADERS.join(","),
    ...logs.map((log) =>
      CSV_HEADERS.map((h) => escape((log as Record<string, unknown>)[h])).join(",")
    ),
  ].join("\r\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="activity-logs-${Date.now()}.csv"`,
    },
  });
}
