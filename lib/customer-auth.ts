import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; email: string; name?: string | null; role: string };
}

export function unauthorized() {
  return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
}
