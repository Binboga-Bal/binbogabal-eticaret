import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { sendTelegramTestMessage } from "@/lib/logger/telegram";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!session.isSuperAdmin) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { chatId } = await req.json();
  if (!chatId) return NextResponse.json({ error: "chatId gerekli" }, { status: 400 });

  const success = await sendTelegramTestMessage(chatId);
  if (!success) {
    return NextResponse.json({ error: "Mesaj gönderilemedi. Token veya chat ID'yi kontrol edin." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
