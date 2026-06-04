export interface SeoScoreInput {
  title?: string | null;
  description?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  schemaMarkup?: unknown;
  noIndex?: boolean;
}

export function calculateSeoScore(input: SeoScoreInput): number {
  let score = 0;

  // Title: 0-25p
  if (input.title) {
    score += 10;
    const len = input.title.length;
    if (len >= 30 && len <= 60) score += 15; // ideal uzunluk
    else if (len >= 20 && len <= 70) score += 8;
  }

  // Description: 0-20p
  if (input.description) {
    score += 5;
    const len = input.description.length;
    if (len >= 120 && len <= 160) score += 15;
    else if (len >= 80 && len <= 200) score += 8;
  }

  // Keywords: 0-10p
  if (input.keywords && input.keywords.length >= 3) score += 10;
  else if (input.keywords && input.keywords.length > 0) score += 5;

  // Canonical: 0-5p
  if (input.canonicalUrl) score += 5;

  // OG Tags: 0-20p
  if (input.ogTitle) score += 5;
  if (input.ogDescription) score += 5;
  if (input.ogImage) score += 10;

  // JSON-LD schema: 0-15p
  if (input.schemaMarkup) score += 15;

  // noIndex ceza
  if (input.noIndex) score = Math.max(0, score - 20);

  return Math.min(100, score);
}

export interface LlmScoreInput {
  llmSummary?: string | null;
  llmKeyFacts?: unknown;
  llmQaPairs?: unknown;
  schemaMarkup?: unknown;
  // llms.txt'de listelenip listelenmediği dışarıdan gelir
  listedInLlmsTxt?: boolean;
  // Robots.txt'de LLM botlarına izin var mı
  llmBotsAllowed?: boolean;
  // Son 30 günde güncellendi mi
  recentlyUpdated?: boolean;
}

export function calculateLlmScore(input: LlmScoreInput): number {
  let score = 0;

  // llmSummary 150+ kelime: +20
  if (input.llmSummary) {
    const words = input.llmSummary.trim().split(/\s+/).length;
    if (words >= 150) score += 20;
    else if (words >= 80) score += 10;
    else score += 5;
  }

  // llmKeyFacts 5+ fact: +15
  if (Array.isArray(input.llmKeyFacts) && input.llmKeyFacts.length >= 5) score += 15;
  else if (input.llmKeyFacts && typeof input.llmKeyFacts === "object") {
    const count = Object.keys(input.llmKeyFacts as object).length;
    if (count >= 5) score += 15;
    else if (count >= 3) score += 8;
  }

  // llmQaPairs 3+ çift: +20
  if (Array.isArray(input.llmQaPairs) && input.llmQaPairs.length >= 3) score += 20;
  else if (Array.isArray(input.llmQaPairs) && input.llmQaPairs.length > 0) score += 10;

  // JSON-LD schema eksiksiz: +10
  if (input.schemaMarkup) score += 10;

  // llms.txt'de listeleniyor: +10
  if (input.listedInLlmsTxt) score += 10;

  // LLM botlarına erişim açık: +10
  if (input.llmBotsAllowed !== false) score += 10;

  // Son 30 günde güncellendi: +5
  if (input.recentlyUpdated) score += 5;

  return Math.min(100, score);
}
