import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { generateLlmsTxt } from "@/lib/seo/generative/llms-txt-generator";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "tr";

  const content = await generateLlmsTxt(locale);
  return NextResponse.json({ content, locale, generatedAt: new Date().toISOString() });
}
