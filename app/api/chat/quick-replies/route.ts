import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const replies = await prisma.chatQuickReply.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(replies);
}
