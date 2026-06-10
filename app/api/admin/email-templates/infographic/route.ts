import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { getInfographic, saveInfographic } from "@/lib/mail/template-content";
import type { EmailInfographic } from "@/lib/mail/infographic-types";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const infographic = await getInfographic();
  return NextResponse.json({ infographic });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as EmailInfographic;

  if (typeof body.show !== "boolean" || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Geçersiz veri formatı" }, { status: 400 });
  }

  const cleaned: EmailInfographic = {
    show: body.show,
    items: body.items
      .slice(0, 4)
      .filter((item) => item.text?.trim())
      .map((item) => ({ icon: item.icon || "honey", text: item.text.trim() })),
  };

  await saveInfographic(cleaned);
  return NextResponse.json({ ok: true, infographic: cleaned });
}
