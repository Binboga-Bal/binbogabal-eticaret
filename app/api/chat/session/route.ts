import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { visitorId, visitorName, visitorEmail, userId } = body as {
    visitorId: string;
    visitorName?: string;
    visitorEmail?: string;
    userId?: string;
  };

  if (!visitorId) {
    return NextResponse.json({ error: "visitorId gerekli" }, { status: 400 });
  }

  // Open session varsa döndür
  const existing = await prisma.chatSession.findFirst({
    where: {
      visitorId,
      status: { not: "CLOSED" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const session = await prisma.chatSession.create({
    data: {
      visitorId,
      visitorName: visitorName ?? null,
      visitorEmail: visitorEmail ?? null,
      userId: userId ?? null,
    },
    include: {
      messages: true,
    },
  });

  return NextResponse.json(session);
}
