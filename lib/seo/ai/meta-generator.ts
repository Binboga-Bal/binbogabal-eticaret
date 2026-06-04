import { getAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from "./client";

export interface MetaGeneratorInput {
  entityType: string;
  entityName: string;
  description?: string | null;
  keywords?: string[];
  locale?: string;
}

export interface MetaGeneratorOutput {
  title: string;
  description: string;
  keywords: string[];
  tokensUsed: number;
}

export async function generateMeta(input: MetaGeneratorInput): Promise<MetaGeneratorOutput> {
  const client = getAnthropicClient();
  const locale = input.locale ?? "tr";

  const systemPrompt = `Sen bir SEO uzmanısın. Türkiye pazarına yönelik e-ticaret ürünleri için
SEO-dostu meta etiketleri üretiyorsun.
- title: 50-60 karakter, birincil anahtar kelimeyi içermeli
- description: 140-160 karakter, güçlü CTA ile bitmeli
- keywords: 5-8 adet, en önemli önce
Yanıtını sadece JSON olarak ver, başka açıklama ekleme.`;

  const userPrompt = `Şu ${input.entityType} için ${locale} dilinde meta etiketleri oluştur:

Ad: ${input.entityName}
${input.description ? `Açıklama: ${input.description.slice(0, 500)}` : ""}
${input.keywords?.length ? `Mevcut anahtar kelimeler: ${input.keywords.join(", ")}` : ""}

JSON formatında döndür:
{
  "title": "...",
  "description": "...",
  "keywords": ["...", "..."]
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
    title: parsed.title ?? "",
    description: parsed.description ?? "",
    keywords: parsed.keywords ?? [],
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
