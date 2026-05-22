import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { name, slug, description, isActive } = await req.json();

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, slug, description: description || null, isActive },
  });

  return NextResponse.json(category);
}
