import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/mail/mail.service";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Ad soyad, e-posta ve mesaj zorunludur." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Mesajınız en az 10 karakter olmalıdır." }, { status: 400 });
    }

    await sendContactFormEmail(name.trim(), email.trim(), subject?.trim() ?? "", message.trim());

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact/route]", err);
    return NextResponse.json({ error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
