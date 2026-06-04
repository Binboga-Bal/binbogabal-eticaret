import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/seo/ai/client";
import { generateMeta } from "@/lib/seo/ai/meta-generator";
import { optimizeForLlm } from "@/lib/seo/ai/llm-optimizer";
import { calculateSeoScore, calculateLlmScore } from "@/lib/seo/score-calculator";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "create")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  if (!isAiEnabled()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 503 });
  }

  const body = await req.json();
  const { entityType, entityId, locale = "tr", mode = "meta" } = body;

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType ve entityId zorunlu" }, { status: 400 });
  }

  // Varlık verisini çek
  let entityData: { name: string; description?: string | null; price?: string } | null = null;

  if (entityType === "product") {
    const product = await prisma.product.findUnique({
      where: { id: entityId },
      include: { variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 } },
    });
    if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    entityData = {
      name: product.name,
      description: product.shortDescription ?? product.description,
      price: product.variants[0] ? `${Number(product.variants[0].price).toLocaleString("tr-TR")} ₺` : undefined,
    };
  } else if (entityType === "blog") {
    const post = await prisma.blogPost.findUnique({ where: { id: entityId } });
    if (!post) return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 });
    entityData = { name: post.title, description: post.excerpt ?? post.content.slice(0, 500) };
  } else if (entityType === "campaign") {
    const campaign = await prisma.campaign.findUnique({ where: { id: entityId } });
    if (!campaign) return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
    entityData = { name: campaign.name, description: campaign.description };
  }

  if (!entityData) {
    return NextResponse.json({ error: "Varlık verisi alınamadı" }, { status: 400 });
  }

  let result: Record<string, unknown> = {};
  let tokensUsed = 0;

  if (mode === "meta" || mode === "full") {
    const meta = await generateMeta({ entityType, entityName: entityData.name, description: entityData.description, locale });
    const seoScore = calculateSeoScore({ title: meta.title, description: meta.description, keywords: meta.keywords });

    await prisma.seoMeta.upsert({
      where: { entityType_entityId_locale: { entityType, entityId, locale } },
      create: { entityType, entityId, locale, title: meta.title, description: meta.description, keywords: meta.keywords, aiGenerated: true, aiGeneratedAt: new Date(), aiModel: "claude-sonnet-4-6", aiTokensUsed: meta.tokensUsed, seoScore },
      update: { title: meta.title, description: meta.description, keywords: meta.keywords, aiGenerated: true, aiGeneratedAt: new Date(), aiTokensUsed: meta.tokensUsed, seoScore },
    });

    result = { ...result, ...meta, seoScore };
    tokensUsed += meta.tokensUsed;
  }

  if (mode === "llm" || mode === "full") {
    const llm = await optimizeForLlm({ entityType, entityName: entityData.name, description: entityData.description, price: entityData.price, locale });
    const llmScore = calculateLlmScore({ llmSummary: llm.llmSummary, llmKeyFacts: llm.llmKeyFacts, llmQaPairs: llm.llmQaPairs, recentlyUpdated: true, llmBotsAllowed: true });

    await prisma.seoMeta.upsert({
      where: { entityType_entityId_locale: { entityType, entityId, locale } },
      create: { entityType, entityId, locale, llmSummary: llm.llmSummary, llmKeyFacts: llm.llmKeyFacts, llmQaPairs: llm.llmQaPairs, llmLastOptimizedAt: new Date(), aiGenerated: true, aiGeneratedAt: new Date(), aiModel: "claude-sonnet-4-6", aiTokensUsed: llm.tokensUsed, llmScore },
      update: { llmSummary: llm.llmSummary, llmKeyFacts: llm.llmKeyFacts, llmQaPairs: llm.llmQaPairs, llmLastOptimizedAt: new Date(), aiTokensUsed: llm.tokensUsed, llmScore },
    });

    result = { ...result, ...llm, llmScore };
    tokensUsed += llm.tokensUsed;
  }

  return NextResponse.json({ ...result, tokensUsed });
}
