import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { type LogLevel, type LogCategory, type Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = req.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
  const skip = (page - 1) * limit;

  const levelParam = searchParams.getAll("level") as LogLevel[];
  const categoryParam = searchParams.getAll("category") as LogCategory[];
  const action = searchParams.get("action") ?? undefined;
  const actorId = searchParams.get("actorId") ?? undefined;
  const actorEmail = searchParams.get("actorEmail") ?? undefined;
  const actorIp = searchParams.get("actorIp") ?? undefined;
  const targetType = searchParams.get("targetType") ?? undefined;
  const targetId = searchParams.get("targetId") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sortBy = (searchParams.get("sortBy") ?? "createdAt") as "createdAt" | "level";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  const where: Prisma.ActivityLogWhereInput = {
    ...(levelParam.length > 0 && { level: { in: levelParam } }),
    ...(categoryParam.length > 0 && { category: { in: categoryParam } }),
    ...(action && { action: { contains: action, mode: "insensitive" } }),
    ...(actorId && { actorId }),
    ...(actorEmail && { actorEmail: { contains: actorEmail, mode: "insensitive" } }),
    ...(actorIp && { actorIp: { startsWith: actorIp } }),
    ...(targetType && { targetType }),
    ...(targetId && { targetId }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
    ...(search && {
      OR: [
        { message: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { actorEmail: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.ActivityLogOrderByWithRelationInput =
    sortBy === "level"
      ? { level: sortOrder }
      : { createdAt: sortOrder };

  const [logs, total, summary] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy, skip, take: limit }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({
      by: ["level"],
      _count: { _all: true },
      where: {
        ...where,
        level: { in: ["CRITICAL", "ERROR", "WARNING"] },
      },
    }),
  ]);

  const summaryMap = Object.fromEntries(summary.map((s) => [s.level, s._count._all]));

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      criticalCount: summaryMap["CRITICAL"] ?? 0,
      errorCount: summaryMap["ERROR"] ?? 0,
      warningCount: summaryMap["WARNING"] ?? 0,
    },
  });
}
