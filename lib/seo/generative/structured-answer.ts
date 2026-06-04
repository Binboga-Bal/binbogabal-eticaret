export interface StructuredAnswer {
  entity: { type: string; id: string; locale: string };
  summary: string | null;
  keyFacts: Record<string, string> | null;
  qaPairs: { q: string; a: string }[] | null;
  relatedEntities: { type: string; id: string; name: string; url: string }[];
  canonicalUrl: string;
  lastUpdated: string;
}

export function buildStructuredAnswer(
  entityType: string,
  entityId: string,
  locale: string,
  seoMeta: {
    llmSummary?: string | null;
    llmKeyFacts?: unknown;
    llmQaPairs?: unknown;
    updatedAt: Date;
    canonicalUrl?: string | null;
  },
  relatedEntities: StructuredAnswer["relatedEntities"] = []
): StructuredAnswer {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return {
    entity: { type: entityType, id: entityId, locale },
    summary: seoMeta.llmSummary ?? null,
    keyFacts: (seoMeta.llmKeyFacts as Record<string, string>) ?? null,
    qaPairs: (seoMeta.llmQaPairs as { q: string; a: string }[]) ?? null,
    relatedEntities,
    canonicalUrl: seoMeta.canonicalUrl ?? `${BASE_URL}/llm-content/${entityType}/${entityId}`,
    lastUpdated: seoMeta.updatedAt.toISOString(),
  };
}
