import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function requireAdmin() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) return null;
  return session;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return forbidden();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "pending" | "approved" | "all"
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const where =
    status === "pending"
      ? { isApproved: false }
      : status === "approved"
      ? { isApproved: true }
      : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, limit });
}
