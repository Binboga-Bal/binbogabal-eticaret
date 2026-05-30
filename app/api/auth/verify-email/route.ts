import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Geçersiz bağlantı" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), emailVerifyToken: null },
  });

  return NextResponse.redirect(new URL("/hesabim?verified=1", req.url));
}
