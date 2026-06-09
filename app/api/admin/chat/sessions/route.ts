import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sessions = await prisma.chatSession.findMany({
    orderBy: [
      { status: "asc" }, // WAITING önce
      { updatedAt: "desc" },
    ],
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, senderType: { not: "ADMIN" } },
          },
        },
      },
    },
  });

  return NextResponse.json(sessions);
}
