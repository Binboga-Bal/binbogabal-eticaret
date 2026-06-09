import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const adminSession = await getAdminSession();
  if (!adminSession) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { sessionId } = await params;

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  // Ziyaretçi mesajlarını okundu olarak işaretle
  await prisma.chatMessage.updateMany({
    where: { sessionId, senderType: { not: "ADMIN" }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const adminSession = await getAdminSession();
  if (!adminSession) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();
  const { content } = body as { content: string };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 });
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminSession.adminId },
    select: { name: true },
  });

  const [msg] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: "ADMIN",
        senderId: adminSession.adminId,
        senderName: adminUser?.name ?? "Müşteri Temsilcisi",
        content: content.trim(),
      },
    }),
    prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        adminId: adminSession.adminId,
        adminName: adminUser?.name ?? "Müşteri Temsilcisi",
      },
    }),
  ]);

  return NextResponse.json(msg);
}
