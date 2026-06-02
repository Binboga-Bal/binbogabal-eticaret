import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validatePassword, hashPassword } from "@/lib/admin-auth/password";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { token, password, name } = parsed.data;

  const admin = await prisma.adminUser.findFirst({
    where: { inviteToken: token, inviteTokenExpiry: { gt: new Date() }, status: "INVITED" },
  });

  if (!admin) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet linki" }, { status: 400 });

  const validation = await validatePassword(password);
  if (!validation.valid) return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 });

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      status: "ACTIVE",
      inviteToken: null,
      inviteTokenExpiry: null,
      name: name ?? admin.name,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

  const admin = await prisma.adminUser.findFirst({
    where: { inviteToken: token, inviteTokenExpiry: { gt: new Date() }, status: "INVITED" },
    select: { email: true, name: true },
  });

  if (!admin) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet" }, { status: 400 });

  return NextResponse.json({ email: admin.email, name: admin.name });
}
