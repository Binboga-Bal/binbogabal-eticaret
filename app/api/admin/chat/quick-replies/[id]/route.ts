import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.chatQuickReply.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await prisma.chatQuickReply.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
