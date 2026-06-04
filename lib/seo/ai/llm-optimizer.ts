import { getAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from "./client";

export interface LlmOptimizerInput {
  entityType: string;
  entityName: string;
  description?: string | null;
  price?: string;
  features?: string[];
  locale?: string;
}

export interface LlmOptimizerOutput {
  llmSummary: string;
  llmKeyFacts: Record<string, string>;
  llmQaPairs: { q: string; a: string }[];
  tokensUsed: number;
}

export async function optimizeForLlm(input: LlmOptimizerInput): Promise<LlmOptimizerOutput> {
  const client = getAnthropicClient();
  const locale = input.locale ?? "tr";

  const systemPrompt = `Sen bir Generative SEO uzmanısın. ChatGPT, Perplexity ve Google Gemini gibi
yapay zeka asistanlarının kolayca anlayıp alıntılayabileceği içerik üretiyorsun.
Yanıtını sadece JSON formatında ver.`;

  const userPrompt = `${locale} dilinde şu ${input.entityType} için LLM-optimize içerik üret:

Ad: ${input.entityName}
${input.description ? `Açıklama: ${input.description.slice(0, 800)}` : ""}
${input.price ? `Fiyat: ${input.price}` : ""}
${input.features?.length ? `Özellikler: ${input.features.join(", ")}` : ""}

JSON formatında döndür:
{
  "llmSummary": "150-200 kelimelik net, olgusal özet. Belirsizlik yok, somut bilgiler.",
  "llmKeyFacts": {
    "Ürün": "...",
    "Fiyat": "...",
    "...: "..."
  },
  "llmQaPairs": [
    {"q": "Bu ürün nedir?", "a": "..."},
    {"q": "...", "a": "..."},
    {"q": "...", "a": "..."}
  ]
}`;

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") throw new Error("AI yanıt vermedi");

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI geçerli JSON döndürmedi");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    llmSummary: parsed.llmSummary ?? "",
    llmKeyFacts: parsed.llmKeyFacts ?? {},
    llmQaPairs: parsed.llmQaPairs ?? [],
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
