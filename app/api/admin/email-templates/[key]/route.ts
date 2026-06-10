import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { saveTemplateContent, EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/mail/template-content";
import type { EmailTemplateContent } from "@/lib/mail/template-content";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((d) => d.key === key);
  if (!definition) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await req.json() as Partial<EmailTemplateContent>;

  if (!body.subject?.trim() || !body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "subject, title ve body zorunludur" }, { status: 400 });
  }

  const content: EmailTemplateContent = {
    subject: body.subject.trim(),
    title: body.title.trim(),
    body: body.body.trim(),
    buttonText: definition.hasButton ? (body.buttonText?.trim() || definition.defaults.buttonText) : undefined,
    note: definition.hasNote ? (body.note?.trim() || undefined) : undefined,
  };

  await saveTemplateContent(key, content);
  return NextResponse.json({ ok: true, content });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((d) => d.key === key);
  if (!definition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reset to defaults by deleting the SiteSetting
  const { prisma } = await import("@/lib/prisma");
  const settingKey = `email_template_${key.replace(/-/g, "_")}`;
  await prisma.siteSetting.deleteMany({ where: { key: settingKey } });

  return NextResponse.json({ ok: true, content: definition.defaults });
}
