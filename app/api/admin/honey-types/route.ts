import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const honeyTypes = await prisma.honeyType.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, label: true },
  });
  return NextResponse.json(honeyTypes);
}
