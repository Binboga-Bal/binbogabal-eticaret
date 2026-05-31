import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const displays = await prisma.campaignDisplay.findMany({
    where: { campaignId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(displays);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const display = await prisma.campaignDisplay.create({
    data: { ...body, campaignId: id },
  });
  return NextResponse.json(display, { status: 201 });
}
