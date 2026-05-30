import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return null;
  }
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const { name, slug, description, isActive, image, order } = await req.json();

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description: description || null }),
      ...(isActive !== undefined && { isActive }),
      ...(image !== undefined && { image: image || null }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
