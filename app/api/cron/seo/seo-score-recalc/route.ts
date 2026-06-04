import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSeoScore, calculateLlmScore } from "@/lib/seo/score-calculator";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const start = Date.now();
  const records = await prisma.seoMeta.findMany();
  let updated = 0;

  for (const record of records) {
    const seoScore = calculateSeoScore({
      title: record.title,
      description: record.description,
      keywords: record.keywords,
      canonicalUrl: record.canonicalUrl,
      ogTitle: record.ogTitle,
      ogDescription: record.ogDescription,
      ogImage: record.ogImage,
      schemaMarkup: record.schemaMarkup,
      noIndex: record.noIndex,
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlyUpdated = record.updatedAt > thirtyDaysAgo;

    const llmScore = calculateLlmScore({
      llmSummary: record.llmSummary,
      llmKeyFacts: record.llmKeyFacts,
      llmQaPairs: record.llmQaPairs,
      schemaMarkup: record.schemaMarkup,
      llmBotsAllowed: true,
      recentlyUpdated,
    });

    await prisma.seoMeta.update({
      where: { id: record.id },
      data: { seoScore, llmScore, lastAuditedAt: new Date() },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated, ms: Date.now() - start });
}
