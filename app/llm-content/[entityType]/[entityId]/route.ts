import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildStructuredAnswer } from "@/lib/seo/generative/structured-answer";

type Params = { params: Promise<{ entityType: string; entityId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { entityType, entityId } = await params;
  const locale = req.nextUrl.searchParams.get("locale") ?? "tr";
  const accept = req.headers.get("accept") ?? "";

  const seoMeta = await prisma.seoMeta.findUnique({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
  });

  if (!seoMeta) {
    return NextResponse.json({ error: "İçerik bulunamadı" }, { status: 404 });
  }

  const answer = buildStructuredAnswer(entityType, entityId, locale, seoMeta);

  // Düz metin formatı (LLM botları için)
  if (accept.includes("text/plain")) {
    const lines: string[] = [];
    lines.push(`# ${entityType}/${entityId} (${locale})`);
    if (answer.summary) lines.push("", answer.summary);
    if (answer.keyFacts) {
      lines.push("", "## Temel Bilgiler");
      for (const [k, v] of Object.entries(answer.keyFacts)) {
        lines.push(`- ${k}: ${v}`);
      }
    }
    if (answer.qaPairs) {
      lines.push("", "## Sık Sorulan Sorular");
      for (const qa of answer.qaPairs) {
        lines.push("", `**${qa.q}**`, qa.a);
      }
    }
    lines.push("", `Son güncelleme: ${answer.lastUpdated}`);

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.json(answer, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
