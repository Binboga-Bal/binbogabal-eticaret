import { prisma } from "@/lib/prisma";
import { generateMeta } from "./meta-generator";
import { optimizeForLlm } from "./llm-optimizer";
import { calculateSeoScore, calculateLlmScore } from "@/lib/seo/score-calculator";
import { isAiEnabled } from "./client";

const RATE_LIMIT_PER_MINUTE = 50;
const BATCH_SIZE = 5;

let requestsThisMinute = 0;
let minuteStart = Date.now();

async function waitForRateLimit() {
  const now = Date.now();
  if (now - minuteStart > 60_000) {
    requestsThisMinute = 0;
    minuteStart = now;
  }
  if (requestsThisMinute >= RATE_LIMIT_PER_MINUTE) {
    const waitMs = 60_000 - (now - minuteStart) + 100;
    await new Promise((r) => setTimeout(r, waitMs));
    requestsThisMinute = 0;
    minuteStart = Date.now();
  }
  requestsThisMinute++;
}

export async function processAiSeoQueue(maxJobs = BATCH_SIZE): Promise<{ processed: number; failed: number }> {
  if (!isAiEnabled()) {
    return { processed: 0, failed: 0 };
  }

  const jobs = await prisma.aiSeoJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: maxJobs,
  });

  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    await prisma.aiSeoJob.update({
      where: { id: job.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    try {
      await waitForRateLimit();
      const inputData = job.inputData as Record<string, unknown>;

      if (job.jobType === "meta_generate") {
        const result = await generateMeta({
          entityType: job.entityType ?? "product",
          entityName: String(inputData.name ?? ""),
          description: String(inputData.description ?? ""),
          keywords: inputData.keywords as string[] | undefined,
          locale: job.locale ?? "tr",
        });

        if (job.entityType && job.entityId && job.locale) {
          const seoScore = calculateSeoScore({
            title: result.title,
            description: result.description,
            keywords: result.keywords,
          });
          await prisma.seoMeta.upsert({
            where: { entityType_entityId_locale: { entityType: job.entityType, entityId: job.entityId, locale: job.locale } },
            create: { entityType: job.entityType, entityId: job.entityId, locale: job.locale, title: result.title, description: result.description, keywords: result.keywords, aiGenerated: true, aiGeneratedAt: new Date(), aiModel: "claude-sonnet-4-6", aiTokensUsed: result.tokensUsed, seoScore },
            update: { title: result.title, description: result.description, keywords: result.keywords, aiGenerated: true, aiGeneratedAt: new Date(), aiTokensUsed: result.tokensUsed, seoScore },
          });
        }

        await prisma.aiSeoJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", outputData: JSON.parse(JSON.stringify(result)), tokensUsed: result.tokensUsed, completedAt: new Date(), model: "claude-sonnet-4-6" },
        });
      } else if (job.jobType === "llm_optimize") {
        const result = await optimizeForLlm({
          entityType: job.entityType ?? "product",
          entityName: String(inputData.name ?? ""),
          description: String(inputData.description ?? ""),
          price: inputData.price as string | undefined,
          locale: job.locale ?? "tr",
        });

        if (job.entityType && job.entityId && job.locale) {
          const llmScore = calculateLlmScore({
            llmSummary: result.llmSummary,
            llmKeyFacts: result.llmKeyFacts,
            llmQaPairs: result.llmQaPairs,
            recentlyUpdated: true,
            llmBotsAllowed: true,
          });
          await prisma.seoMeta.upsert({
            where: { entityType_entityId_locale: { entityType: job.entityType, entityId: job.entityId, locale: job.locale } },
            create: { entityType: job.entityType, entityId: job.entityId, locale: job.locale, llmSummary: result.llmSummary, llmKeyFacts: result.llmKeyFacts, llmQaPairs: result.llmQaPairs, llmLastOptimizedAt: new Date(), aiGenerated: true, aiGeneratedAt: new Date(), aiModel: "claude-sonnet-4-6", aiTokensUsed: result.tokensUsed, llmScore },
            update: { llmSummary: result.llmSummary, llmKeyFacts: result.llmKeyFacts, llmQaPairs: result.llmQaPairs, llmLastOptimizedAt: new Date(), aiTokensUsed: result.tokensUsed, llmScore },
          });
        }

        await prisma.aiSeoJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", outputData: JSON.parse(JSON.stringify(result)), tokensUsed: result.tokensUsed, completedAt: new Date(), model: "claude-sonnet-4-6" },
        });
      } else {
        // Bilinmeyen iş tipi — atla
        await prisma.aiSeoJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date(), errorMessage: `Bilinmeyen jobType: ${job.jobType}` },
        });
      }

      processed++;
    } catch (err) {
      failed++;
      await prisma.aiSeoJob.update({
        where: { id: job.id },
        data: { status: "FAILED", completedAt: new Date(), errorMessage: String(err) },
      }).catch(() => null);
    }
  }

  return { processed, failed };
}
