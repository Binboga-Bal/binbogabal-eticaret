import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { getAllTemplateContents, EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/mail/template-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contents = await getAllTemplateContents();

  const result = EMAIL_TEMPLATE_DEFINITIONS.map((def) => ({
    key: def.key,
    name: def.name,
    description: def.description,
    hasButton: def.hasButton,
    hasNote: def.hasNote,
    content: contents[def.key] ?? def.defaults,
  }));

  return NextResponse.json({ templates: result });
}
