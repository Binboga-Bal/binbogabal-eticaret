import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type LogCategory } from "@prisma/client";

const CUSTOMER_VISIBLE_CATEGORIES: LogCategory[] = [
  "AUTH",
  "ORDER",
  "PAYMENT",
  "USER",
  "COUPON",
  "GDPR",
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: {
        actorId: session.user.id,
        category: { in: CUSTOMER_VISIBLE_CATEGORIES },
        level: { in: ["INFO", "WARNING", "ERROR", "CRITICAL"] },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        level: true,
        category: true,
        action: true,
        message: true,
        targetLabel: true,
        actorIp: true,
        createdAt: true,
        // detail intentionally excluded
      },
    }),
    prisma.activityLog.count({
      where: {
        actorId: session.user.id,
        category: { in: CUSTOMER_VISIBLE_CATEGORIES },
        level: { in: ["INFO", "WARNING", "ERROR", "CRITICAL"] },
      },
    }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
